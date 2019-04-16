import Discord from 'discord.js';
import config from './config.json';
import { log } from './log';
import { message } from './lib/message';

const bot = new Discord.Client();

bot.on('ready', () => log.INFO('Great Herald started working!'));
bot.on('message', message.classify);


bot.login(config.DISCORD_TOKEN);