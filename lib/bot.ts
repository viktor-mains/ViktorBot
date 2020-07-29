import { Client, TextChannel, User } from 'discord.js';
import { msgEdit, msgDelete, userJoin, userLeave, botJoin } from './events';
import { classifyMessage } from './message';
import { log } from './log';

// Mutable module state sucks, but this is the easiest way to migrate what we already have
let bot: Client;

export async function initialize(token: string): Promise<void> {
	bot = new Client();
	bot.on('message', classifyMessage);
	bot.on('messageUpdate', msgEdit);
	bot.on('messageDelete', msgDelete);
	bot.on('guildCreate', botJoin);
	bot.on('guildMemberAdd', userJoin);
	bot.on('guildMemberRemove', userLeave);
	await bot.login(token);
	log.INFO('Viktor Bot starts working.');
}

export function findTextChannel(
	id: string | undefined,
): TextChannel | undefined {
	const ch = id ? bot?.channels.get(id) : undefined;
	if (ch === undefined || ch instanceof TextChannel === false) {
		return undefined;
	}
	return ch as TextChannel;
}

export function isBotUser(user: User): boolean {
	return bot?.user.id === user.id;
}

export async function setBotPresence(status: string): Promise<void> {
	bot?.user.setPresence({
		game: {
			name: status,
			type: 'PLAYING',
		},
	});
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function* enumerateGuilds(): any {
	yield* bot?.guilds.values();
}

export function findMemberJoinDate(
	guildId: string,
	memberId: string,
): Date | undefined {
	const guild = bot.guilds.find(guild => guild.id == guildId);

	const member = guild?.members.find(
		cachedMember => cachedMember.id == memberId,
	);

	return member ? new Date(member?.joinedAt) : undefined;
}
