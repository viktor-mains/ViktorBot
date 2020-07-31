import Discord, { Message } from 'discord.js';
import axios from 'axios';
import v4 from 'uuid/v4';
import { orderBy } from 'lodash';
import { log } from '../../log';
import { initData, descriptionChange } from '../../events';
import {
	upsertUser,
	findUserByDiscordId,
	findAllGuildMembers,
	findOption,
} from '../../storage/db';
import {
	extractNicknameAndServer,
	createEmbed,
	removeKeyword,
	justifyToRight,
	justifyToLeft,
	replaceAll,
	modifyInput,
	extractArguments,
	toMMSS,
} from '../../helpers';
import { getSummonerId, getPlatform, getHost } from './riot';
import { client, getSummonerBySummonerId } from '../../riot';
// @ts-ignore:next-line
import { RIOT_API_TOKEN } from '@config/config.json';
import { format as sprintf } from 'util';
import { isBotUser } from '../../bot';

const timeout = 900000;

const verifyCode = async (
	nickname: string,
	server: string,
	uuid: string,
	msg: Discord.Message,
) => {
	msg.channel.startTyping();
	const playerId = await getSummonerId(nickname, server);
	const realm = await getPlatform(server);
	const url = `https://${realm}.api.riotgames.com/lol/platform/v4/third-party-code/by-summoner/${playerId}?api_key=${RIOT_API_TOKEN}`;
	const continueVerifying = async verificationCode => {
		if (!verificationCode) {
			log.INFO(
				`user ${msg.author.username} failed to register with account ${nickname}, ${server} - ${url} - no data returned`,
			);
			log.INFO(JSON.stringify(verificationCode));
			msg.author.send(
				createEmbed(`❌ Verification failed`, [
					{
						title: '___',
						content: `That's probably a Riot's API error. Try again a bit later.`,
					},
				]),
			);
			msg.channel.stopTyping();
			return;
		}
		if (verificationCode && uuid !== verificationCode.data) {
			log.INFO(
				`user ${msg.author.username} failed to register with account ${nickname}, ${server} - ${url} - incorrect code (${verificationCode.data})`,
			);
			msg.author.send(
				createEmbed(`❌ Incorrect verification code`, [
					{
						title: '___',
						content: `The verification code you've set is incorrect, try again.\nIf this happens consistently, reset the League client.`,
					},
				]),
			);
			msg.channel.stopTyping();
			return;
		}
		const { tier, rank } = await getTierAndDivision(msg, nickname, server);
		const mastery = await getMastery(msg, nickname, server);
		let userData = {};

		const oldData = findUserByDiscordId(msg.author.id);

		if (oldData) {
			const isThisAccountRegistered = oldData['accounts'].find(
				account => account.id === playerId,
			);
			const account = {
				server: server.toUpperCase(),
				id: playerId,
				tier,
				rank,
				mastery,
			};
			if (isThisAccountRegistered) {
				msg.author.send(
					createEmbed(`❌ This account is already registered`, [
						{
							title: '___',
							content: `This account is already registered.`,
						},
					]),
				);
				msg.channel.stopTyping();
				return;
			}
			userData = oldData;
			userData['accounts']
				? userData['accounts'].push(account)
				: (userData['accounts'] = [account]);
		} else {
			userData = {
				discordId: msg.author.id,
				updated: Date.now(),
				accounts: [
					{
						server: server.toUpperCase(),
						id: playerId,
						tier,
						rank,
						mastery,
					},
				],
				membership: {},
			};
		}
		updateRankRoles(msg, userData);
		try {
			await upsertUser(msg.author.id, userData as any);
			await msg.author.send(
				createEmbed(`✅ Profile verified succesfully`, [
					{
						title: '___',
						content: `To check your profile, you can use \`\`!profile\`\` command.`,
					},
				]),
			);
		} catch {
			await msg.author.send(
				createEmbed(`❌ Cannot verify user`, [
					{
						title: '___',
						content: `Getting user's data failed, probably due to problem with database. Try again later.`,
					},
				]),
			);
		} finally {
			msg.channel.stopTyping();
		}
	};

	await axios(url)
		.then(continueVerifying)
		.catch(err => {
			log.INFO(
				`user ${msg.author.username} failed to register with account ${nickname}, ${server} - ${url} - axios error`,
			);
			log.WARN(err);
			msg.author.send(
				createEmbed(`❌ Cannot get verification code`, [
					{
						title: '___',
						content: `Getting 3rd party code failed.`,
					},
				]),
			);
			msg.channel.stopTyping();
			return;
		});
};

const updateRankRoles = async (
	msg: Discord.Message,
	userData,
): Promise<void> => {
	const ranksWeighted = (await findOption('rankRoles')) ?? [];
	let highestTier = 'UNRANKED';

	userData['accounts'].map(account => {
		const rW = ranksWeighted.find(
			rankWeighted =>
				rankWeighted.rank.toLowerCase() === account.tier.toLowerCase(),
		)!;
		const rHT = ranksWeighted.find(
			rankWeighted =>
				rankWeighted.rank.toLowerCase() === highestTier.toLowerCase(),
		)!;
		if (rW.weight < rHT.weight) highestTier = rW.rank;
	});

	const roleToAdd = msg.guild?.roles.cache.find(
		role => role.name.toLowerCase() === highestTier.toLowerCase(),
	);
	const rolesToRemove = msg.member?.roles.cache.filter(
		role =>
			ranksWeighted.find(
				r => r.rank === role.name && r.rank !== roleToAdd?.name,
			) !== undefined,
	);

	if (rolesToRemove && rolesToRemove.size > 0)
		msg.member?.roles.remove(rolesToRemove).catch(err => log.WARN(err));
	if (roleToAdd) msg.member?.roles.add(roleToAdd).catch(err => log.WARN(err));
};

const getTierAndDivision = async (
	msg: Discord.Message,
	nickname: string,
	server: string,
	_playerId?: string,
) => {
	const playerId = _playerId
		? _playerId
		: await getSummonerId(nickname, server);
	const realm = await getPlatform(server);
	const url = `https://${realm}.api.riotgames.com/lol/league/v4/entries/by-summoner/${playerId}?api_key=${RIOT_API_TOKEN}`;
	const userLeagues: any = await axios(url).catch(err => {
		log.INFO(
			`failed to get user's ${msg.author.username} tier/division (${nickname}, ${server}) - ${url}`,
		);
		log.WARN(err);
		return;
	});
	if (!userLeagues || !userLeagues.data) {
		msg.channel.send(
			createEmbed(`❌Cannot get user's data`, [
				{
					title: '___',
					content: `Getting user's rank data failed. Try again later.`,
				},
			]),
		);
		msg.channel.stopTyping();
		return { tier: null, rank: null };
	}
	const soloQ = userLeagues.data.find(
		queue => queue.queueType === 'RANKED_SOLO_5x5',
	);
	const soloQRank = soloQ
		? { tier: soloQ.tier, rank: soloQ.rank }
		: { tier: 'UNRANKED', rank: 'UNRANKED' };
	return soloQRank;
};

const getMastery = async (
	msg: Discord.Message,
	nickname: string,
	server: string,
	_playerId?: string,
) => {
	const playerId = _playerId
		? _playerId
		: await getSummonerId(nickname, server);
	const realm = await getPlatform(server);
	const url = `https://${realm}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${playerId}/by-champion/112?api_key=${RIOT_API_TOKEN}`;
	const userMastery: any = await axios(url).catch(err => {
		log.INFO(
			`failed to get user's ${msg.author.username} mastery (${nickname}, ${server}) - ${url}`,
		);
		log.WARN(err);
		return null;
	});
	if (!userMastery || !userMastery.data) {
		msg.channel.send(
			createEmbed(`❌Cannot get user's data`, [
				{
					title: '___',
					content: `Getting user's mastery failed. Try again later.`,
				},
			]),
		);
		msg.channel.stopTyping();
	}
	const masteryData =
		userMastery && userMastery.data
			? {
					points: userMastery.data.championPoints,
					chest: userMastery.data.chestGranted,
					level: userMastery.data.championLevel,
					lastPlayed: userMastery.data.lastPlayTime,
			  }
			: {
					points: null,
					chest: null,
					level: null,
					lastPlayed: null,
			  };
	return masteryData;
};

export const profile = async (msg: Discord.Message): Promise<void> => {
	msg.channel.startTyping();

	let viktorMastery = 0;
	let lastViktorGame = 0;
	const mentions = [...msg.mentions.users.values()];
	const args = extractArguments(msg);
	if (mentions.length === 0 && args.length !== 0) {
		msg.channel.send(
			createEmbed(`:information_source:  Unoptimal command use`, [
				{
					title: '___',
					content:
						`There are two ways to use this command and yours was none of them:\n\n` +
						`- \`\`!profile\`\` - that way you see your own profile,\n` +
						`- \`\`!profile @mention\`\` - that way you see profile of the mentioned person (use with caution as it pings them)`,
				},
			]),
		);
		msg.channel.stopTyping();
		return;
	}
	const user: Discord.User =
		mentions.length === 0
			? msg.author
			: msg.guild?.members.cache.find(member => member.id === mentions[0].id)
					.user;
	const members = await findAllGuildMembers(msg.guild);
	const memberships = members.map(user => {
		const membership = user.membership.find(
			member => member.serverId === msg.guild?.id,
		);
		return {
			id: user.discordId,
			messageCount: membership?.messageCount ?? 0,
		};
	});

	const sorted = orderBy(memberships, ['messageCount'], ['desc']);
	const userData = await findUserByDiscordId(user.id);
	if (!isBotUser(user)) {
		if (
			!userData ||
			!userData['membership'] ||
			!userData['membership'].find(s => s.serverId === msg.guild?.id)
		) {
			if (user.id === msg.author.id) {
				msg.channel.send(
					createEmbed(
						`:information_source: Cannot find your data in database`,
						[
							{
								title: '___',
								content: `Wait a bit and try again later.`,
							},
						],
					),
				);
				msg.channel.stopTyping();
				return;
			}
			msg.channel.send(
				createEmbed(
					`:information_source: Cannot find ${user.username}'s data in database`,
					[
						{
							title: '___',
							content:
								`It's possible that they are inactive and Vikbot didn't pick them up yet. ` +
								`It also might be a bot account.`,
						},
					],
				),
			);
			msg.channel.stopTyping();
			return;
		}
	}
	const userPosition = sorted.findIndex(u => u.id == user.id);
	const embed = new Discord.MessageEmbed()
		.setColor('FDC000')
		.setThumbnail(user.avatarURL)
		.setFooter(`Last profile's update`)
		// TODO why doesn't it work?
		/* eslint-disable-next-line */
		/* @ts-ignore */
		.setTimestamp(new Date(userData?.updated).toLocaleString())
		.setTitle(`:information_source: ${user.username}'s profile`);

	if (userData && userData.accounts) {
		for (const account of userData?.accounts) {
			const { id, server, rank, tier = 'UNKNOWN' } = account;
			const host = await getHost(server);
			const { data: summoner } = await getSummonerBySummonerId(
				client,
				// TODO fix this ugly hack
				host || '',
				id,
			);
			const opgg = `https://${server}.op.gg/summoner/userName=${modifyInput(
				summoner.name,
			)}`;
			const content = sprintf(
				'IGN: [%s](%s)\nRank: **%s %s**',
				summoner.name,
				opgg,
				tier,
				rank === 'UNRANKED' ? '' : rank,
			);
			viktorMastery = account.mastery.points
				? viktorMastery + account.mastery.points
				: viktorMastery;
			lastViktorGame =
				lastViktorGame > account.mastery.lastPlayed
					? lastViktorGame
					: account.mastery.lastPlayed;
			embed.addField(account.server, content, true);
		}
	}

	embed.addField(
		'Description',
		userData?.description
			? userData.description
					.replace(replaceAll('MEMBER_NICKNAME'), user.username)
					.replace(replaceAll('<br>'), '\n')
			: `This user has no description yet.`,
		false,
	);
	if (userData?.accounts.length ?? 0 > 0) {
		embed.addField(
			'Viktor mastery',
			viktorMastery ? viktorMastery : 'UNKNOWN',
			true,
		);
		embed.addField(
			'Last Viktor game',
			lastViktorGame
				? lastViktorGame === 0
					? 'never >:C'
					: new Date(lastViktorGame).toLocaleDateString()
				: 'UNKNOWN',
			true,
		);
	}
	const memberData = userData?.membership
		? userData.membership.find(member => member.serverId === msg.guild.id)
		: null;
	if (memberData) {
		const messagesPerDay = (
			memberData.messageCount /
			((Date.now() - memberData.joined) / 86400000)
		).toFixed(3);
		embed.addField(
			'Member since',
			memberData.joined < memberData.firstMessage
				? new Date(memberData.joined).toUTCString()
				: new Date(memberData.firstMessage).toUTCString(),
			false,
		);
		embed.addField('Messages written', memberData.messageCount, true);
		embed.addField('Messages per day', messagesPerDay, true);
		embed.addField(
			'# on server',
			userPosition !== -1 ? `#${userPosition + 1}` : '?',
			true,
		);
	}
	msg.channel.send(embed);
	msg.channel.stopTyping();
};

export const description = async (msg: Discord.Message): Promise<void> => {
	msg.channel.startTyping();

	let description = removeKeyword(msg).trim();
	let userData = await findUserByDiscordId(msg.author.id);

	if (userData?.punished) {
		msg.channel.send(
			createEmbed(`❌ You are banned from writing own descriptions`, [
				{
					title: '___',
					content: `Apparently in the past evil mods decided that you aren't responsible enough to write your own description. Shame on you.`,
				},
			]),
		);
		return;
	}
	if (description.length === 0) {
		description =
			'This user is a dummy who cannot use simple bot commands, but what do I expect from League players.';
		msg.channel.send(
			createEmbed(`❌ You forgot description`, [
				{
					title: '___',
					content: `This command requires adding a description. Since you forgot to add it, I've wrote one for you. Have fun.`,
				},
			]),
		);
	}
	if (description.length > 1024) {
		description = `${description.substring(0, 1017)} (...)`;
		msg.channel.send(
			createEmbed(`:information_source: Your description is too long`, [
				{
					title: '___',
					content: `Description must not exceed 1024 characters, so I've cut it down a bit.`,
				},
			]),
		);
	}

	if (!userData) {
		const initUser = initData(null, msg.author.id, msg);
		if (!initUser) return;
		userData = initUser;
	}
	userData.description = description;

	try {
		await upsertUser(msg.author.id, userData);
	} catch (err) {
		log.WARN(err);
		msg.channel.send(
			createEmbed(`❌Something went wrong`, [
				{
					title: '___',
					content: `Something went wrong. Tell Arcyvilk to check logs.`,
				},
			]),
		);
	}

	descriptionChange(msg);
	msg.channel.send(
		createEmbed(`✅ Description updated succesfully`, [
			{
				title: '___',
				content: `To check your profile, you can use \`\`!profile\`\` command.`,
			},
		]),
	);
	msg.channel.stopTyping();
};

export const update = async (msg: Discord.Message): Promise<void> => {
	const member = await findUserByDiscordId(msg.author.id);
	if (!member) {
		msg.channel.send(
			createEmbed(`:information_source: You didn't register yet`, [
				{
					title: '___',
					content: `Use the \`\`!register <IGN> | <server>\`\` command to create your profile.`,
				},
			]),
		);
		msg.channel.stopTyping();
		return;
	}
	const lastUpdated = Date.now() - member.updated;
	const timeoutUpdate = 3600000;
	if (lastUpdated < timeoutUpdate) {
		const embed = new Discord.MessageEmbed()
			.setFooter(`Last profile update`)
			.setTimestamp(new Date(member.updated))
			.setTitle(`:information_source: Profile recently updated`)
			.setColor('0xFDC000');
		embed.addField(
			'___',
			`Wait ${toMMSS(timeoutUpdate - lastUpdated)} before updating again.`,
			false,
		);
		msg.channel.send(embed);
		msg.channel.stopTyping();
		return;
	}
	const updateAccounts = async (index: number) => {
		if (!member.accounts[index]) return finalize();
		const account = member.accounts[index];
		const { tier, rank } = await getTierAndDivision(
			msg,
			'',
			account.server,
			account.id,
		);
		const mastery = await getMastery(msg, '', account.server, account.id);
		const updatedAcc = { ...account };
		updatedAcc.tier = tier ? tier : updatedAcc.tier;
		updatedAcc.rank = rank ? rank : updatedAcc.rank;
		updatedAcc.mastery = mastery.lastPlayed ? mastery : updatedAcc.mastery;
		member.accounts[index] = updatedAcc;
		updateAccounts(index + 1);
	};

	const finalize = async () => {
		updateRankRoles(msg, member);
		member.updated = Date.now();
		try {
			await upsertUser(msg.author.id, member);

			await msg.channel.send(
				createEmbed(`✅ Profile updated succesfully`, [
					{
						title: '___',
						content: `To check your profile, you can use \`\`!profile\`\` command.`,
					},
				]),
			);
		} catch (error) {
			log.WARN(error);
			await msg.channel.send(
				createEmbed(`❌ Cannot update user`, [
					{
						title: '___',
						content: `Updating user's data failed. Try again later.`,
					},
				]),
			);
		} finally {
			msg.channel.stopTyping();
		}
	};

	updateAccounts(0);
};

export const topmembers = async (msg: Discord.Message): Promise<void> => {
	const count = (await findOption('topMembers')) ?? 10;
	const guildMembers = await findAllGuildMembers(msg.guild);
	const counts = guildMembers
		.filter(user => msg.guild?.members.cache.find(m => m.id === user.discordId))
		.map(user => {
			const membership = user.membership.find(
				m => m.serverId === msg.guild?.id,
			);
			return {
				id: user.discordId,
				messageCount: membership?.messageCount ?? 0,
			};
		});

	const sorted = orderBy(counts, ['messageCount'], ['desc']);
	let content = '';
	sorted.map((member, index) => {
		if (index < count && sorted[index]) {
			const justifiedPosition = justifyToLeft((index + 1).toString(), 2);
			const justifiedMsgCount = justifyToRight(
				member.messageCount.toString(),
				6,
			);
			const { username } = msg.guild.members.find(m => m.id === member.id).user;
			content += `\`\`#${justifiedPosition} - ${justifiedMsgCount} msg\`\` - ${username}\n`;
		}
	});
	const embed = createEmbed(`🏆 Top ${count} members`, [
		{ title: '___', content },
	]);
	msg.channel.send(embed);
};

export const register = async (msg: Discord.Message): Promise<void> => {
	const { nickname, server } = extractNicknameAndServer(msg);
	const oldData = await findUserByDiscordId(msg.author.id);
	const maxAccounts = (await findOption('maxAccounts')) ?? 2;
	const uuid = `VIKBOT-${v4()}`;

	if (!nickname || !server) return;
	if (oldData && oldData.accounts && oldData.accounts.length >= maxAccounts) {
		msg.channel.send(
			createEmbed(`❌ You registered maximum amount of accounts`, [
				{
					title: '___',
					content: `The maximum number of accounts you can register is **${maxAccounts}**.`,
				},
			]),
		);
		return;
	}

	const embed = new Discord.MessageEmbed()
		.setColor('FDC000')
		.setFooter(
			`Your code expires at ${new Date(
				Date.now() + timeout,
			).toLocaleTimeString()}`,
		)
		.setTitle(`Your unique verification code!`)
		.addField(
			'___',
			`\`\`${uuid}\`\`
            \nCopy the above code, login into your ${nickname} account on server ${server}, go into Settings -> Verification, paste the code in the text box and click "Send".
            \nAfter it's done, react with the :white_check_mark:.
            \n[Picture visualizing it step-by-step](https://i.imgur.com/4GsXTQC.png)`,
		);

	msg.author
		.send(embed)
		.then(sentEmbed => {
			// Bad cast
			sentEmbed = sentEmbed as Message;
			msg.react('📩');
			const reactions = ['✅', '❌'];
			const filter = (reaction, user) =>
				msg.author.id === user.id &&
				(reaction.emoji.name === '❌' || reaction.emoji.name === '✅');
			const iterateReactions = (index: number) => {
				if (index >= reactions.length) return;
				sentEmbed.react(reactions[index]);
				setTimeout(() => iterateReactions(index + 1), 500);
			};
			iterateReactions(0);

			sentEmbed
				.awaitReactions(filter, {
					time: timeout,
					maxEmojis: 1,
				})
				.then(collected => {
					const [c] = collected.map(col => ({
						name: col.emoji.name,
						message: col.message,
					}));
					if (c && c.name === '✅') verifyCode(nickname, server, uuid, msg);
					else {
						log.INFO(
							`user ${msg.author.username} aborted registering ${nickname} [${server}]`,
						);
						msg.author.send(
							createEmbed(`:information_source: Profile registering aborted`, [
								{
									title: '___',
									content: `You can do it some other time.`,
								},
							]),
						);
						msg.channel.stopTyping();
					}
				})
				.catch(e => log.WARN(e));
		})
		.catch(() => {
			msg.channel.send(
				createEmbed(':warning: I am unable to reply to you', [
					{
						title: '___',
						content: `This command sends the reply to your DM, and it seems you have DMs from members of this server disabled.
            \nTo be able to receive messages from me, go to \`\`User Settings => Privacy & Safety => Allow direct messages from server members\`\` and then resend the command.`,
					},
				]),
			);
			msg.channel.stopTyping();
		});
	return;
};

export const unregister = async (msg: Discord.Message): Promise<void> => {
	msg.channel.startTyping();
	const { nickname, server } = extractNicknameAndServer(msg);
	const realm = await getPlatform(server);
	const playerId = await getSummonerId(nickname, server);
	const oldData = await findUserByDiscordId(msg.author.id);

	if (!nickname || !server) {
		msg.channel.stopTyping();
		return;
	}
	if (!playerId || !realm) {
		msg.channel.send(
			createEmbed('❌ Incorrect nickname or server', [
				{
					title: '___',
					content: "Check if the data you've provided is correct.",
				},
			]),
		);
		msg.channel.stopTyping();
		return;
	}
	if (!oldData || !oldData.accounts) {
		msg.channel.send(
			createEmbed(`:information_source: Provided account isn't registered`, [
				{
					title: '___',
					content: `This account was never registered in the first place.`,
				},
			]),
		);
		msg.channel.stopTyping();
		return;
	}
	const newData = { ...oldData };
	newData.accounts = oldData.accounts.filter(
		account => account.id !== playerId,
	);
	if (oldData.accounts.length === newData.accounts.length) {
		msg.channel.send(
			createEmbed(`:information_source: Provided account isn't registered`, [
				{
					title: '___',
					content: `This account was never registered in the first place.`,
				},
			]),
		);
		msg.channel.stopTyping();
		return;
	}
	updateRankRoles(msg, newData);

	try {
		await upsertUser(msg.author.id, newData);
		await msg.channel.send(
			createEmbed(`✅ Account unregistered succesfully`, [
				{
					title: '___',
					content: `To check your profile, you can use \`\`!profile\`\` command.`,
				},
			]),
		);
	} catch (err) {
		log.WARN(err);
	} finally {
		msg.channel.stopTyping();
	}
};
