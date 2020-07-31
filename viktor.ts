require('module-alias/register');
import { connectToDb } from './lib/storage/db';
import { initialize } from './lib/bot';
import { log } from './lib/log';

// @ts-ignore:next-line
import { DATABASE_URL, DISCORD_TOKEN } from '@config/config.json';

async function main() {
	await connectToDb(DATABASE_URL);
	await initialize(DISCORD_TOKEN);
}

main().catch(error => log.WARN(error));
