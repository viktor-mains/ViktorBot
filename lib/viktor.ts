import { connectToDb } from './storage/db';
import { initialize } from './bot';
import { log } from './utils/log';
import { env } from './env';

async function main() {
	const dbUrl = env.DATABASE_URL;
	const discordToken = env.DISCORD_TOKEN;

	if (!dbUrl) throw new Error("DATABASE_URL is missing!");
	if (!discordToken) throw new Error("DISCORD_TOKEN is missing!");

	await connectToDb(dbUrl);
	await initialize(discordToken);
}

main().catch(error => log.WARN(error));
