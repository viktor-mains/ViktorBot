import dotenv from 'dotenv';

interface Env {
	CAT_API_TOKEN: string;
	DATABASE_URL: string;
  DISCORD_TOKEN: string;
	RIOT_API_TOKEN: string;
}

const getEnv = () => {
  // Determine which .env file to load
  const envFile = process.env.ENV === 'dev' ? '.env.dev' : '.env.prod';
  dotenv.config({ path: envFile });

  const {
    CAT_API_TOKEN = undefined,
    DATABASE_URL = undefined,
    DISCORD_TOKEN = undefined,
    RIOT_API_TOKEN = undefined,
  } = process.env;

  if (!CAT_API_TOKEN) throw new Error('CAT_API_TOKEN is missing!');
  if (!DATABASE_URL) throw new Error('DATABASE_URL is missing!');
  if (!DISCORD_TOKEN) throw new Error('DISCORD_TOKEN is missing!');
  if (!RIOT_API_TOKEN) throw new Error('RIOT_API_TOKEN is missing!');

  return {
    CAT_API_TOKEN,
    DATABASE_URL,
    DISCORD_TOKEN,
    RIOT_API_TOKEN,
  };
}

export const env: Env = getEnv()