import '@babel/polyfill';
import Discord from 'discord.js';
import config from './config.json';
import { log } from './lib/log';
import { classifyMessage } from './lib/message';
import { connectToDb } from './lib/storage/db';
import { msgEdit, msgDelete, userJoin, userLeave, botJoin } from './lib/events';
import { cache } from './lib/storage/cache';

const bot = new Discord.Client();

const ready = bot => {
    cache.bot = bot;
    config.DATABASES.map(db => connectToDb(db));
    init(bot);
}

const init = bot => {
    log.INFO('Great Herald started working!');
    bot.on('message', classifyMessage);
    bot.on('messageUpdate', msgEdit);
    bot.on('messageDelete', msgDelete);
    bot.on('guildCreate', botJoin)
    bot.on('guildMemberAdd', userJoin);
    bot.on('guildMemberRemove', userLeave);

    // [TODO]
    // bot.on('presenceUpdate', handleStream);
}

bot.on('ready', () => ready(bot));
bot.login(config.DISCORD_TOKEN);
