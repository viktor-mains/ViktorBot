import { connectToDb } from './lib/storage/db';
import { initialize } from './lib/bot';
import { log } from './lib/log';
import * as Config from './lib/config';

async function main() {
	const dbUrl = Config.get('DATABASE_URL');
	const discordToken = Config.get('DISCORD_TOKEN');
	await connectToDb(dbUrl);
	await initialize(discordToken);
}

main().catch(error => log.WARN(error));
