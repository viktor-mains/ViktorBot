import Discord, { Guild } from 'discord.js';
import { orderBy } from 'lodash';
import moment from 'moment';
import { log } from './log';
import {
	upsertUser,
	isKnownMember,
	findUserByDiscordId,
	User,
	findOption,
} from './storage/db';
import { createEmbed, toDDHHMMSS, removeKeyword, replaceAll } from './helpers';
import { findTextChannel } from './bot';

type LogRoom = 'room_log_msgs' | 'room_log_users';

const sendLog = async (
	guild: Guild,
	embed: Discord.RichEmbed,
	name: LogRoom,
) => {
	const option = (await findOption(name)) ?? [];
	const room = option.find(r => r.guild === guild.id);
	const channel = findTextChannel(room?.id);
	if (channel === undefined) {
		return;
	}

	await channel.send(embed);
};

const sendGlobalLog = async (
	embed: Discord.RichEmbed,
	guild: Discord.Guild,
) => {
	const room = await findOption('room_global');
	const channel = findTextChannel(room);

	if (channel === undefined) {
		return;
	}

	embed.addField('Guild name', guild.name, true);
	embed.addField('Guild id', guild.id, true);

	await channel.send(embed);
};

export const msgEdit = (oldMsg: Discord.Message, newMsg: Discord.Message) => {
	if (
		oldMsg.channel.type === 'dm' ||
		oldMsg.author.bot ||
		oldMsg.content === newMsg.content ||
		!oldMsg.content
	)
		return;
	const oldTimestamp = new Date(oldMsg.createdTimestamp);
	const newTimestamp = new Date();
	const messageLink = `https://discordapp.com/channels/${newMsg.guild.id}/${newMsg.channel.id}/${newMsg.id}`;
	const log = createEmbed(
		`:clipboard: MESSAGE EDITED`,
		[
			{
				title: `Author`,
				content: `${oldMsg.author.username}#${oldMsg.author.discriminator}`,
				inline: true,
			},
			{
				title: `Channel`,
				content: `<#${oldMsg.channel.id}>`,
				inline: true,
			},
			{
				title: `Msg link`,
				content: `[click](${messageLink})`,
				inline: true,
			},
			{
				title: `Old message`,
				content: oldMsg.content,
				inline: false,
			},
			{
				title: `New message`,
				content: newMsg.content,
				inline: false,
			},
			{
				title: `Created at`,
				content: moment(oldTimestamp).format(
					'MMMM Do YYYY, HH:mm:ss',
				),
				inline: true,
			},
			{
				title: `Edited at`,
				content: moment(newTimestamp).format(
					'MMMM Do YYYY, HH:mm:ss',
				),
				inline: true,
			},
		],
		'83C4F2',
	);
	sendLog(oldMsg.guild, log, 'room_log_msgs');
};

export const msgDelete = (msg: Discord.Message) => {
	if (msg.channel.type === 'dm' || msg.author.bot) return;
	const oldTimestamp = new Date(msg.createdTimestamp);
	const newTimestamp = new Date();
	const attachments =
		[...msg.attachments.values()].length != 0
			? [...msg.attachments.values()]
					.map((att: any) => att.proxyURL)
					.join(' ')
			: 'none';
	const content = msg.content
		? msg.content
		: '_empty message or picture_';
	const log = createEmbed(
		`:no_mobile_phones: MESSAGE DELETED`,
		[
			{
				title: `Author`,
				content: `${msg.author.username}#${msg.author.discriminator}`,
				inline: true,
			},
			{
				title: `Channel`,
				content: `<#${msg.channel.id}>`,
				inline: true,
			},
			{ title: `Content`, content: content, inline: false },
			{
				title: `Attachments`,
				content: attachments,
				inline: false,
			},
			{
				title: `Created at`,
				content: moment(oldTimestamp).format(
					'MMMM Do YYYY, HH:mm:ss',
				),
				inline: true,
			},
			{
				title: `Deleted at`,
				content: moment(newTimestamp).format(
					'MMMM Do YYYY, HH:mm:ss',
				),
				inline: true,
			},
		],
		'C70000',
	);
	sendLog(msg.guild, log, 'room_log_msgs');
};

export const userJoin = async (member: Discord.GuildMember) => {
	const log = createEmbed(
		`:man: USER JOINS`,
		[
			{
				title: `User`,
				content: `${member.user.username}#${member.user.discriminator}`,
				inline: false,
			},
			{
				title: `Joined at`,
				content: moment(
					member.joinedAt.toISOString(),
				).format('MMMM Do YYYY, HH:mm:ss'),
				inline: true,
			},
		],
		'51E61C',
	);
	sendLog(member.guild, log, 'room_log_users');

	if (member.user.bot) return;
	if (!isKnownMember(member)) {
		await upsertUser(member.id, initData(member));
	} else {
		handleUserNotInDatabase(member);
	}
};

export const userLeave = (member: Discord.GuildMember) => {
	const log = createEmbed(
		`:wave: USER LEAVES`,
		[
			{
				title: `User`,
				content: `${member.user.username}#${member.user.discriminator}`,
				inline: false,
			},
			{
				title: `Was a member for`,
				content: toDDHHMMSS(member.joinedAt)
					? toDDHHMMSS(member.joinedAt)
					: '?',
				inline: true,
			},
			{
				title: `Leaves at`,
				content: moment(
					new Date().toISOString(),
				).format('MMMM Do YYYY, HH:mm:ss a')
					? moment(
							new Date().toISOString(),
					  ).format('MMMM Do YYYY, HH:mm:ss a')
					: '?',
				inline: true,
			},
		],
		'C70000',
	);
	sendLog(member.guild, log, 'room_log_users');
};

export const descriptionChange = (msg: Discord.Message) => {
	const log = createEmbed(
		`✍️ USER CHANGES DESCRIPTION`,
		[
			{
				title: `User`,
				content: `${msg.author.username}#${msg.author.discriminator}`,
				inline: false,
			},
			{ title: `ID`, content: msg.author.id, inline: false },
			{
				title: `New description`,
				content: removeKeyword(msg),
				inline: false,
			},
			{
				title: `Changed at`,
				content: moment(
					new Date().toISOString(),
				).format('MMMM Do YYYY, HH:mm:ss a'),
				inline: false,
			},
		],
		'8442f5',
	);
	const guild = msg.member ? msg.member.guild.id : msg.author.id;
	sendLog(msg.guild, log, 'room_log_users');
	sendGlobalLog(log, msg.member.guild);
};

export const botJoin = (guild: Discord.Guild) => {
	const botLog = createEmbed(
		`:man: BOT JOINS GUILD`,
		[
			{
				title: `Joined at`,
				content: moment(Date.now()).format(
					'MMMM Do YYYY, HH:mm:ss',
				),
				inline: true,
			},
		],
		'51E61C',
	);
	log.INFO(`Great Herald joined ${guild.id} guild!`);
	sendGlobalLog(botLog, guild);
};

export const initData = (
	member: Discord.GuildMember | null,
	id?: any,
	msg?: any,
): User => {
	// member = null means that they used to be part of Discord but aren't anymore, or Discord doesn't recognize them
	return {
		id,
		discordId: member ? member.id : id,
		updated: Date.now(),
		accounts: [],
		punished: false,
		description: undefined,
		membership: [
			{
				serverId: member
					? member.guild.id
					: msg
					? msg.guild.id
					: 0,
				messageCount: 0,
				firstMessage: 0,
				joined:
					member && member.joinedAt
						? new Date(
								member.joinedAt,
						  ).getTime()
						: Date.now(),
			},
		],
	};
};

export const handleUserNotInDatabase = async (
	member: Discord.GuildMember,
	msg?: Discord.Message | null,
) => {
	if (msg && !msg.member && msg.author.id === msg.channel.id)
		// DM
		return;
	const user = msg?.author ?? member;
	const memberUserId = msg ? msg.author.id : member ? member.id : null;
	const memberGuildId =
		msg && msg.guild
			? msg.guild.id
			: member && member.guild
			? member.guild.id
			: null;
	if (!memberUserId || !memberGuildId) return;
	const update = async (
		member: Discord.GuildMember | Discord.User,
		memberInDataBase,
	) => {
		const memberIndex = memberInDataBase.membership.findIndex(
			m => m.serverId === memberGuildId,
		);
		if (memberIndex !== -1) {
			// user is in the database and in the server
			memberInDataBase.membership[memberIndex].messageCount =
				memberInDataBase.membership[memberIndex]
					.messageCount + 1;
			if (
				memberInDataBase.membership[memberIndex]
					.joined === 0
			)
				memberInDataBase.membership[
					memberIndex
				].joined = Date.now();
			if (
				memberInDataBase.membership[memberIndex]
					.firstMessage === 0
			)
				memberInDataBase.membership[
					memberIndex
				].firstMessage = Date.now();
			await upsertUser(member.id, memberInDataBase);
		} else {
			// user is in database but not in the server
			const serverData = {
				serverId: memberGuildId,
				messageCount: 1,
				firstMessage: Date.now(),
				joined: msg
					? msg.member && msg.member.joinedAt
						? new Date(
								msg.member.joinedAt,
						  ).getTime()
						: Date.now()
					: 0,
			};
			memberInDataBase.membership.push(serverData);
			await upsertUser(member.id, memberInDataBase);
		}
	};

	let memberInDataBase = await findUserByDiscordId(member.id);
	if (memberInDataBase === undefined) {
		// user not in database at all
		if (member) update(user, initData(member));
		if (msg && msg.member) update(user, initData(null, msg.member));
		if (msg && !msg.member)
			update(user, initData(null, msg.author.id, msg));
	} // user in database
	else update(user, memberInDataBase);
};

export const handlePossibleMembershipRole = async (msg: Discord.Message) => {
	if (!msg.member)
		// sent in DM
		return;
	const user = await findUserByDiscordId(msg.author.id);
	const membership =
		user?.membership.find(
			guild => guild.serverId === msg.guild.id,
		) ?? null;
	const membershipRoles = (await findOption('membershipRoles')) ?? null;

	if (membership === null || !membershipRoles || !user) return;

	const memberMsgCount = membership.messageCount;
	const memberJoinDate =
		membership.joined < membership.firstMessage
			? membership.joined
			: membership.firstMessage;
	const neededRoles = orderBy(membershipRoles, ['weight'], ['desc'])
		.filter(
			role =>
				role.requirement.messages <= memberMsgCount &&
				role.requirement.time <=
					Date.now() - memberJoinDate,
		)
		.filter((role, index) => role.persistent || index === 0); // only persistent roles and one with highest weight
	membershipRoles.map(mR => {
		if (
			neededRoles.find(nR => nR.name === mR.name) &&
			!msg.member.roles.some(r => r.name === mR.name) &&
			msg.member.guild.roles.find(
				role =>
					role.name.toLowerCase() ===
					mR.name.toLowerCase(),
			)
		) {
			const roleToAdd = msg.member.guild.roles.find(
				role =>
					role.name.toLowerCase() ===
					mR.name.toLowerCase(),
			);
			msg.member.addRole(roleToAdd);
			informAboutPromotion(msg, mR);
		} else if (
			!neededRoles.find(nR => nR.name === mR.name) &&
			msg.member.roles.some(r => r.name === mR.name) &&
			msg.member.guild.roles.find(
				role =>
					role.name.toLowerCase() ===
					mR.name.toLowerCase(),
			)
		) {
			const roleToRemove = msg.member.guild.roles.find(
				role =>
					role.name.toLowerCase() ===
					mR.name.toLowerCase(),
			);
			msg.member.removeRole(roleToRemove);
		}
	});
};

const informAboutPromotion = (msg: Discord.Message, role: any) => {
	const embedTitle: string = role.message.title
		.replace(replaceAll('MEMBER_USERNAME'), msg.author.username)
		.replace(replaceAll('MEMBERSHIP_ROLE'), role.name);
	const embedContent: string = role.message.content
		.replace(replaceAll('MEMBER_USERNAME'), msg.author.username)
		.replace(replaceAll('MEMBERSHIP_ROLE'), role.name)
		.replace(replaceAll('<br>'), '\n');
	const embedColor: string = role.message.color;
	const embedIcon: string = role.message.icon;
	const embed = new Discord.RichEmbed()
		.setTitle(`${embedIcon} ${embedTitle}`)
		.setThumbnail(msg.author.avatarURL)
		.setColor(embedColor)
		.addField(`\_\_\_`, embedContent, false)
		.setFooter(`Powered by Glorious Evolution`)
		.setTimestamp(new Date());
	msg.channel.send(embed);
};
