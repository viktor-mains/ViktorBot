import Discord from 'discord.js';
import { orderBy } from 'lodash';
import {
	upsertOne,
	findUserByDiscordId,
	findOption,
	findChampion,
	findServerByName,
	findLane,
	findQueue,
} from '../../storage/db';
import {
	extractNicknameAndServer,
	createEmbed,
	extractArguments,
} from '../../helpers';
import {
	client,
	fetchChampions,
	fetchVersions,
	fetchRecentGames,
	fetchMatchInfo,
	fetchMatchTimeline,
	getSummonerByName,
	Summoner,
	fetchSummonerMasteries,
	getSummonerByAccountId,
} from '../../riot';
import { format as sprintf } from 'util';

export const getPlatform = async (server?: string) => {
	const { platform } = await findServerByName(server);
	return platform;
};

export const getHost = async (server?: string) => {
	const { host } = await findServerByName(server);
	return `https://${host}`;
};

export const getSummonerId = async (
	ign: string | undefined,
	server: string | undefined,
) => {
	if (!ign || !server) {
		return undefined;
	}

	try {
		const host = await getHost(server);
		if (host === undefined) {
			return undefined;
		}

		const summoner = await getSummonerByName(client, host, ign);
		return summoner.data.id;
	} catch (err) {
		return undefined;
	}
};

const getAccountId = async (
	ign: string | undefined,
	server: string | undefined,
) => {
	if (!ign || !server) {
		return undefined;
	}

	try {
		const host = await getHost(server);
		if (host === undefined) {
			return undefined;
		}

		const summoner = await getSummonerByName(client, host, ign);
		return summoner.data.accountId;
	} catch (err) {
		return undefined;
	}
};

export const updatechampions = async (msg: Discord.Message) => {
	const { data: versions } = await fetchVersions(client);
	const version = versions[0];
	const { data: champions } = await fetchChampions(client, version);

	const tasks = Object.values(champions.data).map(async champion => {
		try {
			await upsertOne(
				'champions',
				{ id: champion.key },
				{
					id: champion.key,
					name: champion.name,
					title: champion.title,
					img: `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`,
				},
			);
		} catch {
			await msg.channel.send(
				createEmbed(`❌ Error updating champions`, [
					{
						title: '___',
						content: `${champion.name} couldn't get updated. :C`,
					},
				]),
			);
		}
	});

	await Promise.all(tasks);

	await msg.channel.send(
		createEmbed('✅ Champions updated', [
			{ title: '___', content: `Version: ${version}` },
		]),
	);
};

export const lastlane = async (msg: Discord.Message) => {
	msg.channel.startTyping();
	const { nickname, server } = extractNicknameAndServer(msg);
	const playerId = await getAccountId(nickname, server);
	const host = await getHost(server);
	if (!nickname || !server) return msg.channel.stopTyping();
	if (!playerId || !host) {
		await msg.channel.send(
			createEmbed('❌ Incorrect nickname or server', [
				{
					title: '___',
					content:
						"Check if the data you've provided is correct.",
				},
			]),
		);
		msg.channel.stopTyping();
		return;
	}

	const recentGames = await fetchRecentGames(client, host, playerId);
	if (recentGames.data.matches.length === 0) {
		// No known recent games?
		msg.channel.send(
			createEmbed('❌ Incorrect nickname or server', [
				{
					title: '___',
					content:
						"Check if the data you've provided is correct.",
				},
			]),
		);
		msg.channel.stopTyping();
		return;
	}

	const matchBaseData = recentGames.data.matches[0];
	const matchId = matchBaseData.gameId;
	const [lastGameData, lastGameTimeline] = await Promise.all([
		fetchMatchInfo(client, host, matchId),
		fetchMatchTimeline(client, host, matchId),
	]);

	let players: any = [];
	let winningTeam: any = '';

	lastGameData.data.teams.map((team: any) => {
		if (team.win === 'Win') winningTeam = team.teamId;
	});
	lastGameData.data.participantIdentities.map((participant: any) => {
		players.push({
			gameId: participant.participantId,
			id: participant.player.accountId,
			name: participant.player.summonerName,
		});
	});
	lastGameData.data.participants.map(async participant => {
		const i = players.findIndex(
			player => player.gameId === participant.participantId,
		);
		players[i].win = participant.teamId === winningTeam;
		players[i].teamId = participant.teamId;
		players[i].championId = participant.championId;
		players[i].champion = await findChampion(
			participant.championId,
		);
		players[i].summ1 = participant.spell1Id;
		players[i].summ2 = participant.spell2Id;
		players[i].fbkill = participant.stats.firstBloodKill;
		players[i].fbassist = participant.stats.firstBloodAssist;
		players[i].role = participant.timeline.role;
		players[i].lane = participant.timeline.lane;
	});
	const ourPlayer = players.find(player => player.id === playerId);
	const enemies = players.filter(
		player =>
			player.lane === ourPlayer.lane &&
			player.teamId !== ourPlayer.teamId,
	);
	const lane = (await findLane(ourPlayer.lane))!;
	const queue = (await findQueue(ourPlayer.queue))!;

	const embed = new Discord.RichEmbed()
		.setColor('FDC000')
		.setThumbnail(
			lane
				? lane.icon
				: 'https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/256x256/question.png',
		)
		.setTimestamp(new Date(matchBaseData.timestamp))
		.setFooter(
			`${queue.map}, ${queue.queue}`,
			ourPlayer.champion ? ourPlayer.champion.img : lane.icon,
		);

	if (enemies.length === 0) {
		const content =
			'There was no lane opponent in this game.\nEither it was a bot game, one of the laners roamed a lot or one of the laners was AFK.';
		embed.setTitle(
			`${
				ourPlayer.champion
					? ourPlayer.champion.name.toUpperCase()
					: '???'
			}`,
		)
			.setDescription(
				`**${ourPlayer.name}** (${
					ourPlayer.champion
						? ourPlayer.champion.name
						: '???'
				})`,
			)
			.addField('Some info', content);
	} else {
		const relevantMinutes = [5, 10, 15];
		const gameFrames: any = {};

		embed.setTitle(
			sprintf(
				'%s vs %s',
				ourPlayer.champion?.name.toUpperCase() ?? '???',
				enemies
					.map(
						e =>
							e.champion?.name.toUpperCase() ??
							'???',
					)
					.join(' '),
			),
		).setDescription(
			sprintf(
				"**%s's** %s %s vs %s in %d minutes",
				ourPlayer.name,
				ourPlayer.champion?.name.toUpperCase() ?? '???',
				ourPlayer.win ? 'wins' : 'loses',
				enemies
					.map(e => {
						return sprintf(
							"**%s's** %s",
							e.champion?.name.toUpperCase() ??
								'???',
						);
					})
					.join(' '),
				Math.round(
					parseInt(
						lastGameData.data.gameDuration,
					) / 60,
				),
			),
		);

		relevantMinutes.map((minute: number) => {
			if (lastGameTimeline.data.frames[minute]) {
				const timeline =
					lastGameTimeline.data.frames[minute]
						.participantFrames;
				const player: any = Object.values(
					timeline,
				).find(
					(player: any) =>
						player.participantId ===
						ourPlayer.gameId,
				);

				gameFrames[`min${minute}`] = {
					player: {
						cs:
							player.minionsKilled +
							player.jungleMinionsKilled,
						gold: player.totalGold,
						level: player.level,
					},
					enemies: [],
					allyTeam: 0,
					enemyTeam: 0,
				};

				enemies.map((enemy: any) => {
					const player: any = Object.values(
						timeline,
					).find(
						(player: any) =>
							player.participantId ===
							enemy.gameId,
					);
					gameFrames[`min${minute}`].enemies.push(
						{
							id: enemy.gameId,
							cs:
								player.minionsKilled +
								player.jungleMinionsKilled,
							gold: player.totalGold,
							level: player.level,
						},
					);
				});

				Object.values(timeline).map((player: any) => {
					const currentPlayer = players.find(
						(p: any) =>
							p.gameId ===
							player.participantId,
					);
					if (
						currentPlayer &&
						currentPlayer.teamId !==
							ourPlayer.teamId &&
						currentPlayer.lane !==
							ourPlayer.lane
					)
						gameFrames[
							`min${minute}`
						].enemyTeam += player.totalGold;
					if (
						currentPlayer &&
						currentPlayer.teamId ===
							ourPlayer.teamId &&
						currentPlayer.lane !==
							ourPlayer.lane
					)
						gameFrames[
							`min${minute}`
						].allyTeam += player.totalGold;
				});

				const playerChampionName = ourPlayer.champion
					? ourPlayer.champion.name
					: '[unknown ally champion]';
				const enemyChampionName = enemies[0].champion
					? enemies[0].champion.name
					: '[unknown enemy champion]';
				const playerGold =
					gameFrames[`min${minute}`].player.gold;
				const playerCs =
					gameFrames[`min${minute}`].player.cs;
				const enemyCs =
					gameFrames[`min${minute}`].enemies[0]
						.cs;
				const enemyGold =
					gameFrames[`min${minute}`].enemies[0]
						.gold;
				const allyTeamGoldAdvantage =
					gameFrames[`min${minute}`].allyTeam -
					gameFrames[`min${minute}`].enemyTeam;
				const minuteSummary = gameFrames[`min${minute}`]
					? `${playerChampionName} has **${Math.abs(
							playerGold - enemyGold,
					  )}** gold ${
							playerGold - enemyGold >
							0
								? 'advantage'
								: 'disadvantage'
					  }.
                        Creep scores are ${playerChampionName}'s **${playerCs}** to ${enemyChampionName}'s **${enemyCs}**.
                        All other lanes ${
				allyTeamGoldAdvantage >= 0 ? 'win' : 'lose'
			} with **${Math.abs(allyTeamGoldAdvantage)}** gold ${
							allyTeamGoldAdvantage >=
							0
								? 'advantage'
								: 'disadvantage'
					  }.`
					: 'Game ended by now.';
				embed.addField(
					`Minute ${minute}`,
					minuteSummary,
				);
			}
		});
	}
	msg.channel.stopTyping();
	msg.channel.send(embed);
};

export const mastery = async (msg: Discord.Message) => {
	msg.channel.startTyping();
	const selfRequest = !!!extractArguments(msg).length;

	if (selfRequest) {
		const user = await findUserByDiscordId(msg.author.id);
		const accounts = user?.accounts ?? [];
		if (accounts.length !== 0) {
			for (const account of accounts) {
				const platform = await getPlatform(
					account.server,
				);
				const host = await getHost(account.server);
				if (!platform || !!host) {
					continue;
				}
				const {
					data: summoner,
				} = await getSummonerByAccountId(
					client,
					host,
					account.id,
				);

				aggregateMasteryData(
					msg,
					summoner.name,
					account.server,
					platform,
					summoner,
				);
			}

			return;
		} else {
			msg.channel.send(
				createEmbed(
					`:information_source: You don't have any accounts registered`,
					[
						{
							title: '___',
							content: `To use this commands without arguments you have to register your League account first: \`\`!register <IGN> | <server>\`\`.
                        Otherwise, this command can be used as follows: \`\`!mastery IGN|server\`\`.`,
						},
					],
				),
			);
		}
	} else {
		const { nickname, server } = extractNicknameAndServer(msg);
		if (nickname === undefined || server === undefined) {
			return;
		}

		const host = await getHost(server);
		if (host === undefined) {
			return;
		}

		const { data: summoner } = await getSummonerByName(
			client,
			host,
			nickname,
		);

		aggregateMasteryData(msg, nickname, server, host, summoner);
	}
};

const aggregateMasteryData = async (
	msg: Discord.Message,
	nickname: string,
	server: string,
	host: string,
	summoner: Summoner,
) => {
	const topX = (await findOption('topMasteries')) ?? 3;
	const masteryIcons = (await findOption('masteryIcons')) ?? [];
	const masteryData = await fetchSummonerMasteries(
		client,
		host,
		summoner,
	);
	const masteryList = orderBy(
		masteryData.data,
		['championPoints'],
		['desc'],
	).slice(0, topX);
	const mostMasteryChampion = masteryList[0]
		? await findChampion(masteryList[0].championId)
		: null;
	const mostMasteryIcon = mostMasteryChampion?.img;
	const collectiveMasteryLevels = { level5: 0, level6: 0, level7: 0 };
	let collectiveMastery = 0;
	masteryData.data.map(d => {
		collectiveMastery = collectiveMastery + d.championPoints;
		[5, 6, 7].includes(d.championLevel)
			? collectiveMasteryLevels[`level${d.championLevel}`]++
			: null;
	});
	let collectiveMasteryLevelsString = '';
	for (const level of Object.keys(collectiveMasteryLevels)) {
		const icon = masteryIcons.find(
			mI => level.indexOf(mI.mastery.toString()) !== -1,
		);
		collectiveMasteryLevelsString += `${icon?.emote} x${collectiveMasteryLevels[level]} `;
	}

	const embed = new Discord.RichEmbed()
		.setTitle(
			`Top ${topX} masteries - ${nickname.toUpperCase()} [${server.toUpperCase()}]`,
		)
		.setDescription(
			`${collectiveMasteryLevelsString}\n**Collective mastery**: ${collectiveMastery}`,
		)
		.setTimestamp(new Date())
		.setFooter(msg.author.username)
		.setColor(0xfdc000);

	if (mostMasteryIcon !== undefined) {
		embed.setThumbnail(mostMasteryIcon);
	}
	const tasks = masteryList.map(async mastery => {
		const champion = await findChampion(mastery.championId);
		if (champion === undefined) {
			return;
		}

		const masteryIcon = masteryIcons.find(
			mI => mI.mastery === mastery.championLevel,
		);
		let title = `${champion.name}, ${champion.title}`;
		if (masteryIcon)
			title = `${masteryIcon.emote} ${title} ${
				mastery.chestGranted
					? '<:chest_unlocked:672434420195655701>'
					: ''
			}`;
		embed.addField(
			title,
			`**Points**: ${mastery.championPoints}\n` +
				`**Last game**: ${new Date(
					mastery.lastPlayTime,
				).toLocaleDateString()}`,
			false,
		);
	});

	await Promise.all(tasks);

	msg.channel.send(embed);
	msg.channel.stopTyping();
};
