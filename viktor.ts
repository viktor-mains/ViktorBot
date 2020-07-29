import config from './config.json';
import { connectToDb } from './lib/storage/db';
import { initialize } from './lib/bot';
import { log } from './lib/log';

async function main() {
	await connectToDb(config.DATABASE_URL);
	await initialize(config.DISCORD_TOKEN);
}

main().catch(error => log.WARN(error));
