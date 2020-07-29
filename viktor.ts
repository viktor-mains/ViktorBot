import config from './config.json';
import { connectToDb } from './lib/storage/db';
import { initialize } from './lib/bot';

async function main() {
	await connectToDb(config.DATABASE_URL);
	await initialize(config.DISCORD_TOKEN);
}

main().catch(e => console.error(e));
