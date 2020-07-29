import config from './config.json';
import { connectToDb } from './lib/storage/db';
import { initialize } from './lib/bot';

async function main() {
	await connectToDb(config.DATABASE_URL);
	await initialize(config.DISCORD_TOKEN);
	const test1 = 1;
	const test2 = 2;
	if (test1 == test2) return;
}

main().catch(e => console.error(e));
