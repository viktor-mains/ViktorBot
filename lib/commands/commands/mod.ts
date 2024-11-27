import Discord from 'discord.js';
import { log } from '../../utils/log';
import { removeKeyword, extractArguments, createEmbed } from '../../utils/helpers';
import { chooseRandom } from '../../utils/rng';
import { upsertUser, findUserByDiscordId, findOption } from '../../storage/db';
import {
	setBotPresence,
	findTextChannel,
	enumerateGuilds,
	/* findMemberJoinDate, */
} from '../../bot';

export const status = async (msg: Discord.Message): Promise<void> => {
	await setBotPresence(removeKeyword(msg));
};

export const impersonate = (msg: Discord.Message): void => {
	const messageAndGuild = extractArguments(msg);
	if (messageAndGuild.length !== 2) {
		msg.channel.send(
			createEmbed(`❌ Wrong syntax`, [
				{
					title: '___',
					content:
						'This command requires exactly two arguments: ``message|channel_id``.',
				},
			]),
		);
		return;
	}
	const channel = findTextChannel(messageAndGuild[1]);
	if (!channel) {
		msg.channel.send(
			createEmbed(`❌ Error`, [
				{
					title: '___',
					content: `I don't have access to this channel, you dummy.`,
				},
			]),
		);
		return;
	}
	channel.send(messageAndGuild[0]).catch(e => {
		msg.channel.send(
			createEmbed(`❌ Something went wrong`, [{ title: '___', content: e }]),
		);
		log.WARN(e);
	});
};

export const punish = async (msg: Discord.Message): Promise<void> => {
	msg.channel.startTyping();
	const mentions = [...msg.mentions.users.values()];
	let member;

	if (mentions.length === 0) {
		msg.channel.send(
			createEmbed(`❌ Incorrect syntax`, [
				{
					title: '___',
					content: "You didn't mention the person you want to punish.",
				},
			]),
		);
		msg.channel.stopTyping();
		return;
	}

	const guildMember =
		msg.guild &&
		msg.guild.members.cache.find(member => member.id === mentions[0].id);
	if (!guildMember) throw 'This member does not exist.';
	const { user } = guildMember;

	if (!user) {
		msg.channel.send(
			createEmbed(`❌ Something went wrong`, [
				{
					title: '___',
					content:
						"Apparently, according to Discord this user doesn't exist. Reset the client or something.",
				},
			]),
		);
		msg.channel.stopTyping();
		return;
	}
	member = await findUserByDiscordId(user.id);

	if (!member) {
		msg.channel.send(
			createEmbed(`❌ Something went wrong`, [
				{
					title: '___',
					content:
						"Apparently, according to Discord this user doesn't exist. Reset the client or something.",
				},
			]),
		);
		msg.channel.stopTyping();
		return;
	}

	const opt = await findOption('descriptionPunish');
	const punish = opt ? chooseRandom(opt) : 'I wet myself at night. :pensive:';
	if (member.punished === true) {
		member = {
			...member,
			punished: false,
			description: null,
		};
		msg.channel.send(
			createEmbed(`:information_source: Member ${user.username} unpunished`, [
				{
					title: '___',
					content:
						'They can go back to writing cringy descriptions about themselves.',
				},
			]),
		);
	} else {
		member = {
			...member,
			punished: true,
			description: punish,
		};
		msg.channel.send(
			createEmbed(`:information_source: Member ${user.username} punished`, [
				{
					title: '___',
					content: 'No more nasty descriptions from that one.',
				},
			]),
		);
	}
	msg.channel.stopTyping();
	await upsertUser(msg.author.id, member);
};

// export const msgupdate = (msg: Discord.Message): void => {
// TODO this entire function needs to be redone to include database
// msg.channel.startTyping();
// readFile('messageCount.json', 'utf8', (err, data) => {
// 	if (err) {
// 		log.WARN(err.message);
// 		return;
// 	}
// 	const messageDataFile = JSON.parse(data);
// 	const membersRaw = [];
// 	// remake the file into somewhat more normal format
// 	for (const [keyServer, valueServer] of Object.entries(
// 		messageDataFile,
// 	)) {
// 		for (const [keyMember, valueMember] of Object.entries(
// 			messageDataFile[keyServer],
// 		)) {
// 			membersRaw.push({
// 				...messageDataFile[keyServer][
// 					keyMember
// 				],
// 				serverId: keyServer,
// 				discordId: keyMember,
// 			});
// 		}
// 	}
// 	// now map thru it and check if user already is in database
// 	membersRaw.map(async (mTU, index) => {
// 		log.INFO(`User ${index + 1}/${membersRaw.length}`);
// 		let membersData;
// 		const user = await findUserByDiscordId(mTU.discordId);
// 		const date = findMemberJoinDate(
// 			mTU.serverId,
// 			mTU.discordId,
// 		)?.getTime();
// 		const joinDate = date ?? mTU.firstMessage;
// 		if (!joinDate) console.log(mTU.discordId);
// 		if (user) {
// 			// if user IS in database, just update his membership
// 			membersData = { ...user };
// 			if (!membersData.membership) return; // probably bot
// 			let serverDataIndex = membersData.membership.findIndex(
// 				mShip =>
// 					mShip.serverId === mTU.serverId,
// 			);
// 			if (serverDataIndex !== -1) {
// 				// if this server of user is in database
// 				// membersData.membership[serverDataIndex] = {
// 				//     serverId: mTU.serverId,
// 				//     messageCount: mTU.messageCount,
// 				//     firstMessage: mTU.firstMessage,
// 				//     joined: joinDate
// 				// }
// 			} else {
// 				// if this server of user is not in database
// 				membersData.membership.push({
// 					serverId: mTU.serverId,
// 					messageCount: mTU.messageCount,
// 					firstMessage: mTU.firstMessage,
// 					joined: joinDate,
// 				});
// 			}
// 		} else {
// 			// if user ISNT in database, init him and then add all his servers
// 			// const savedMemberData = initData(null, mTU.discordId);
// 			// membersData = {
// 			//     ...savedMemberData,
// 			//     membership: [{
// 			//         serverId: mTU.serverId,
// 			//         messageCount: mTU.messageCount,
// 			//         firstMessage: mTU.firstMessage,
// 			//         joined: joinDate
// 			//     }]
// 			// }
// 		}
// 		await upsertUser(mTU.discordId, membersData);
// 	});
// 	msg.channel.stopTyping();
// });
// };

export const guilds = (msg: Discord.Message): void => {
	let content = '';
	for (const guild of enumerateGuilds()) {
		content += `- \`\`[${guild.id}]\`\` ${guild.name}\n`;
	}

	const embed = createEmbed("Viktor Bot's guilds", [{ title: '___', content }]);
	msg.channel.send(embed);
};

export const ismember = (msg: Discord.Message): void => {
	const [userID] = extractArguments(msg);
	const isMember = msg.guild?.members.cache.find(member => member.id == userID)
		? true
		: false;
	msg.channel.send(
		createEmbed(`Is user ${userID} in this guild?`, [
			{ title: '___', content: isMember ? 'Yes.' : 'No.' },
		]),
	);
};
