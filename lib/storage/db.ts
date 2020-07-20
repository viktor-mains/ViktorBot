import { MongoClient, Db } from "mongodb";
import { cache } from "./cache";
import assert from "assert";
import type { User as DiscordUser, GuildMember } from "discord.js";

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

interface User {}

export async function upsertUser(id: DiscordUser | GuildMember, user: User) {
  await upsertOne("users", { discordId: id }, user);
}
