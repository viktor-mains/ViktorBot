import Discord from 'discord.js';
import config from './config.json';
import { log } from './log';

const bot = new Discord.Client();

bot.on('ready', () => log.INFO('Great Herald started working!'));


bot.login(config.DISCORD_TOKEN);