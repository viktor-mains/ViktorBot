import { MongoClient, Db } from "mongodb";
import { cache } from "./cache";
import assert from "assert";
import type { User as DiscordUser, GuildMember, Guild } from "discord.js";

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

export function isKnownMember(member: GuildMember): boolean {
  return findUserByDiscordId(member.id) !== undefined;
}

export function findUserByDiscordId(id: string): User | undefined {
  return cache["users"].find((u) => u.discordId === id);
}

export function findAllGuildMembers(guild: Guild): User[] {
  return cache["users"].filter((user: User) => {
    const membership = user.membership?.find(
      (member) => member.serverId === guild.id
    );

    return membership !== undefined;
  });
}
