import assert from 'assert';
import path from 'path';
import fs from 'fs';

let config: Options;

interface Options {
	DISCORD_TOKEN: string;
	RIOT_API_TOKEN: string;
	CAT_API_TOKEN: string;
	DATABASE_URL: string;
}

export function load(): void {
	if (config !== undefined) {
		return;
	}

	const location = path.resolve(process.cwd(), 'config.json');
	const file = fs.readFileSync(location, 'utf8');
	config = JSON.parse(file);
}

export function get<K extends keyof Options>(name: K): Options[K] {
	load();

	const value = config[name];
	assert.notStrictEqual(value, undefined, `"${name}" not present in config`);
	return value;
}
