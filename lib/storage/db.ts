import { MongoClient, Db } from "mongodb";
import { cache } from "./cache";
import assert from "assert";
import type { User as DiscordUser, GuildMember, Guild } from "discord.js";
import { IEmbed } from "../types/command";

const DB_NAME = "vikbot";
let db: Db;

export const connectToDb = async (url: string) => {
  const client = await MongoClient.connect(url);
  db = client.db(DB_NAME);

  await updateCache();
};

export const updateCache = async () => {
  assert.ok(
    db !== undefined,
    "have not connected to the database - make sure connectToDb() is called at least once"
  );

  for (const collection of await db.collections()) {
    const data = await collection.find({}).toArray();
    cache[collection.collectionName] = data;
  }
};

export async function upsertOne<T>(name: string, filter: object, object: T) {
  assert.ok(
    db !== undefined,
    "have not connected to the database - make sure connectToDb() is called at least once"
  );

  await db
    .collection<T>(name)
    .updateOne(filter, { $set: object }, { upsert: true });

  await updateCache();
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
    chest: number;
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

export async function upsertUser(id: DiscordUser | GuildMember, user: User) {
  await upsertOne("users", { discordId: id }, user);
}

export async function isKnownMember(member: GuildMember): Promise<boolean> {
  return findUserByDiscordId(member.id) !== undefined;
}

export async function findUserByDiscordId(
  id: string
): Promise<User | undefined> {
  return cache["users"].find((u) => u.discordId === id);
}

export async function findAllGuildMembers(guild: Guild): Promise<User[]> {
  return cache["users"].filter((user: User) => {
    const membership = user.membership?.find(
      (member) => member.serverId === guild.id
    );

    return membership !== undefined;
  });
}

interface Option<T> {
  value: T;
}

interface Options {
  description_punish: string[];
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
  degen_words: string[];
  maxAccounts: number;
  room_log_msgs: {
    guild: string;
    id: string;
  }[];
  room_log_users: {
    guild: string;
    id: string;
  }[];
  room_global: string;
  commandSymbol: string;
}

export async function findOption<K extends keyof Options>(
  name: K
): Promise<Options[K] | undefined> {
  const opt: Option<Options[K]> | undefined = cache["options"].find(
    (option) => option.option === name
  );

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
  return cache["commands"].filter((cmd: Command) => cmd.isModOnly);
}

export async function findUserCommands(): Promise<Command[]> {
  return cache["commands"].filter((cmd: Command) => !cmd.isModOnly);
}

export async function findCommandByKeyword(
  keyword: string
): Promise<Command | undefined> {
  return cache["commands"].find(
    (cmd: Command) => cmd.keyword.toLowerCase() === keyword.toLowerCase()
  );
}

interface Lane {
  lane: string;
  icon: string;
}

export async function findLane(lane: string): Promise<Lane | undefined> {
  return cache["lanes"].find((l: Lane) => l.lane === lane);
}

interface Queue {
  queue: string;
  map: string;
}

export async function findQueue(queue: string): Promise<Queue | undefined> {
  return cache["queues"].find((q: Queue) => q.queue === queue);
}

interface Champion {
  id: string;
  img: string;
  name: string;
  title: string;
}

export async function findChampion(id: string): Promise<Champion | undefined> {
  return cache["champions"].find((c: Champion) => c.id === id);
}

interface Server {
  region: string;
  name: string;
}

export async function findServerByName(
  name: string
): Promise<string | undefined> {
  const s = cache["servers"].find(
    (s: Server) => s.region.toUpperCase() === name.toUpperCase()
  );

  return s?.name;
}

export interface Reaction {
  id: string;
  keywords: string[];
}

export async function findReactionsById(id: string): Promise<Reaction[]> {
  return cache["reactions"].filter((r: Reaction) => r.id === id);
}

export async function findReactionsInMessage(msg: string): Promise<Reaction[]> {
  const content = msg.toLowerCase();
  // This could probably be much quicker with a lookup table - it will slow down quite a bit as more reactions get added
  return cache["reactions"].filter((r: Reaction) => {
    const words = r.keywords.filter((keyword) => content.includes(keyword));
    return words.length > 0;
  });
}
