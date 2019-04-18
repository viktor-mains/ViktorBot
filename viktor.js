import '@babel/polyfill';
import Discord from 'discord.js';
import config from './config.json';
import { log } from './log';
import { classifyMessage } from './lib/message';

const bot = new Discord.Client();

bot.on('ready', () => log.INFO('Great Herald started working!'));
bot.on('message', classifyMessage);

bot.login(config.DISCORD_TOKEN);