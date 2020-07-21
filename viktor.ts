import "@babel/polyfill";
import config from "./config.json";
import { log } from "./lib/log";
import { connectToDb } from "./lib/storage/db";
import { initialize } from "./lib/bot";

async function main() {
  await connectToDb(config.DATABASE_URL);
  await initialize(config.DISCORD_TOKEN);
  log.INFO("Great Herald started working!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
