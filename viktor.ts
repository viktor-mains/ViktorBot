import "@babel/polyfill";
import Discord from "discord.js";
import config from "./config.json";
import { log } from "./lib/log";
import { classifyMessage } from "./lib/message";
import { connectToDb } from "./lib/storage/db";
import { msgEdit, msgDelete, userJoin, userLeave, botJoin } from "./lib/events";
import { cache } from "./lib/storage/cache";

async function main() {
  await connectToDb(config.DATABASE_URL);
  const bot = new Discord.Client();
  bot.on("message", classifyMessage);
  bot.on("messageUpdate", msgEdit);
  bot.on("messageDelete", msgDelete);
  bot.on("guildCreate", botJoin);
  bot.on("guildMemberAdd", userJoin);
  bot.on("guildMemberRemove", userLeave);
  await bot.login(config.DISCORD_TOKEN);
  log.INFO("Great Herald started working!");

  cache["bot"] = bot;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
