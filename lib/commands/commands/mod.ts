import Discord from 'discord.js';
import { log } from '../../log';
import { removeKeyword, extractArguments } from '../../helpers';
import { updateCache } from '../../storage/db';
import { cache } from '../../storage/cache';
import config from '../../../config.json';

export const status = (msg:Discord.Message) => cache["bot"].user.setPresence({ game: { name: removeKeyword(msg), type: 0}})

export const impersonate = (msg:Discord.Message) => {
    const messageAndGuild = extractArguments(msg);
    if (messageAndGuild.length !== 2) {
        msg.channel.send('This command requires exactly two arguments: ``message|channel_id``.');
        return;
    }
    const channel = cache["bot"].channels.get(messageAndGuild[1]);
    if (!channel) {
        msg.channel.send(`I don't have access to this channel.`);
        return;
    }
    channel.send(messageAndGuild[0])
        .catch(e => {
            msg.channel.send(`Something went wrong.`)
            log.WARN(e);
        });
}

export const refresh = (msg:Discord.Message) => {
    config.DATABASES.map(db => updateCache(db.symbol));
    return msg.react('✔️');
}