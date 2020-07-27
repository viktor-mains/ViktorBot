import Discord from "discord.js";
import config from "./config.json";
import { log } from "./lib/log";
import { classifyMessage } from "./lib/message";
import { connectToDb } from "./lib/storage/db";
import { msgEdit, msgDelete, userJoin, userLeave, botJoin } from "./lib/events";

async function main() {
  await connectToDb(config.DATABASE_URL);

  const bot = new Discord.Client();
  bot.on("message", classifyMessage);
  bot.on("messageUpdate", msgEdit);
  bot.on("messageDelete", msgDelete);
  bot.on("guildCreate", botJoin);
  bot.on("guildMemberAdd", userJoin);
  bot.on("guildMemberRemove", userLeave);
  bot.on("ready", () => {
    log.INFO("Great Herald started working!");
  });

  await bot.login(config.DISCORD_TOKEN);
}

main().catch((e) => console.error(e));
