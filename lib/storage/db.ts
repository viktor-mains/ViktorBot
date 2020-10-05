import { MongoClient, Db } from 'mongodb';
import assert from 'assert';
import type { GuildMember, Guild } from 'discord.js';
import { IEmbed } from '../types/command';

const DB_NAME = 'vikbot';
let db: Db;

export const connectToDb = async (url: string): Promise<void> => {
	const client = await MongoClient.connect(url);
	db = client.db(DB_NAME);
};

export async function upsertOne<T>(
	name: string,
	filter: any,
	object: T,
): Promise<void> {
	assert.ok(
		db !== undefined,
		'have not connected to the database - make sure connectToDb() is called at least once',
	);
	await db
		.collection<T>(name)
		.updateOne(filter, { $set: object }, { upsert: true });
}

export interface Account {
	server: string;
	id: string;
	tier: string;
	rank: string;
	name: string;
	opgg: string;
	mastery: {
		points: number;
		chest: boolean;
		level: number;
		lastPlayed: number;
	};
}

export interface User {
	id: string;
	discordId: string;
	updated: number;
	punished: boolean;
	description: string | undefined;
	accounts: Account[];
	membership: {
		serverId: string;
		messageCount: number;
		joined: number;
		firstMessage: number;
	}[];
}

export async function upsertUser(id: string, user: User): Promise<void> {
	// TODO this throws cyclic dependency error - FIX IT!
	await upsertOne('users', { discordId: id }, user);
}

export async function isKnownMember(member: GuildMember): Promise<boolean> {
	return findUserByDiscordId(member.id) !== undefined;
}

export async function findUserByDiscordId(
	id?: string,
): Promise<User | undefined> {
	if (!id) return;
	const user = await db.collection('users').findOne({ discordId: id });
	return user;
}

export async function findAllGuildMembers(
	guild?: Guild | null,
): Promise<User[] | void> {
	if (!guild) return;
	const results = db.collection('users').find({
		membership: {
			$elemMatch: {
				serverId: guild.id,
			},
		},
	});

	return await results.toArray();
}

interface Option<T> {
	value: T;
}

interface Options {
	descriptionPunish: string[];
	topMasteries: number;
	masteryIcons: {
		mastery: number;
		emote: string;
	}[];
	assignableRoles: string[];
	room_roles: {
		id: string;
		guild: string;
	}[];
	shutUpMod: string[];
	shutUpUser: string[];

	rankRoles: {
		name: string;
		rank: string;
		weight: number;
	}[];

	modRoles: string[];
	membershipRoles: {
		name: string;
	}[];

	jokeRoles: string[];
	topMembers: number;
	gibeskin: {
		key: string;
		value: number;
		viktor: boolean;
	}[];
	degenWords: string[];
	maxAccounts: number;
	room_log_msgs: {
		guild: string;
		id: string;
	}[];
	room_log_users: {
		guild: string;
		id: string;
	}[];
	roomGlobal: string;
	commandSymbol: string;
}

export async function findOption<K extends keyof Options>(
	name: K,
): Promise<Options[K] | undefined> {
	type T = Option<Options[K]>;
	const opt = await db.collection('options').findOne<T>({ option: name });
	return opt?.value;
}

export interface Command {
	keyword: string;
	isModOnly: boolean;
	description?: string;
	text?: string;
	embed?: IEmbed;
}

export async function findModCommands(): Promise<Command[]> {
	const r = db.collection('commands').find({
		isModOnly: true,
	});

	return await r.toArray();
}

export async function findUserCommands(): Promise<Command[]> {
	const r = db.collection('commands').find({
		isModOnly: false,
	});

	return await r.toArray();
}

export async function findCommandByKeyword(
	keyword: string,
): Promise<Command | undefined> {
	const c = db.collection('commands');
	return (await c.findOne({ keyword })) ?? undefined;
}

interface Lane {
	lane: string;
	icon: string;
}

export async function findLane(lane: string): Promise<Lane | undefined> {
	const c = db.collection('lanes');
	return (await c.findOne({ lane })) ?? undefined;
}

interface Queue {
	queue: string;
	map: string;
}

export async function findQueue(queue: string): Promise<Queue | undefined> {
	const c = db.collection('queues');
	return (await c.findOne({ queue })) ?? undefined;
}

interface Champion {
	id: string;
	img: string;
	name: string;
	title: string;
}

export async function findChampion(id: number): Promise<Champion | undefined> {
	const champion = await db.collection('champions').findOne({ id });
	return champion;
}

interface Server {
	region: string;
	name: string;
}

export async function findServerByName(
	name?: string,
): Promise<{ region: string; platform: string; host: string }> {
	const c = db.collection('servers');
	const def = { host: undefined, platform: undefined, region: undefined };
	const region = (await c.findOne({ region: name?.toUpperCase() })) ?? def;
	return region;
}

export interface Reaction {
	id: string;
	keywords: string[];
	reactionList: any[];
}

export async function findReactionsById(id: string): Promise<Reaction[]> {
	return await db.collection('reactions').find({ id }).toArray();
}

export async function findAllReactionsInMessage(
	msg: string,
): Promise<Reaction[]> {
	const content = msg.toLowerCase().split(' ');
	// This could probably be much quicker with a lookup table - it will slow down quite a bit as more reactions get added
	const reactions = await db.collection('reactions').find({}).toArray();
	return reactions.filter((r: Reaction) => {
		const words = r.keywords.filter(keyword => content.includes(keyword));
		// all of the keywords must be present in the sentence at once
		return words.length === r.keywords.length;
	});
}
