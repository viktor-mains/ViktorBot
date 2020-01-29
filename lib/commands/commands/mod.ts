import Discord from 'discord.js';
import { log } from '../../log';
import { removeKeyword, extractArguments, createEmbed } from '../../helpers';
import { chooseRandom } from '../../rng';
import { updateCache, upsertOne } from '../../storage/db';
import { cache } from '../../storage/cache';
import config from '../../../config.json';

export const status = (msg:Discord.Message) => cache["bot"].user.setPresence({ game: { name: removeKeyword(msg), type: 0}})

export const impersonate = (msg:Discord.Message) => {
    const messageAndGuild = extractArguments(msg);
    if (messageAndGuild.length !== 2) {
        msg.channel.send(createEmbed(`❌ Wrong syntax`, [{ title: '\_\_\_', content: 'This command requires exactly two arguments: ``message|channel_id``.' }]));
        return;
    }
    const channel = cache["bot"].channels.get(messageAndGuild[1]);
    if (!channel) {
        msg.channel.send(createEmbed(`❌ Error`, [{ title: '\_\_\_', content: `I don't have access to this channel, you dummy.` }]));
        return;
    }
    channel.send(messageAndGuild[0])
        .catch(e => {
            msg.channel.send(createEmbed(`❌ Something went wrong`, [{ title: '\_\_\_', content: e }]));
            log.WARN(e);
        });
}

export const refresh = (msg:Discord.Message) => {
    config.DATABASES.map(db => updateCache(db.symbol));
    return msg.react('✔️');
}

export const punish = (msg:Discord.Message) => {
    msg.channel.startTyping();
    const mentions = [ ...msg.mentions.users.values() ];
    let user:Discord.User;
    let member;
    
    if (mentions.length === 0) {
        msg.channel.send(createEmbed(`❌ Incorrect syntax`, [{ title: '\_\_\_', content: 'You didn\'t mention the person you want to punish.' }]));
        msg.channel.stopTyping();
        return;
    }

    user = msg.guild.members.find(member => member.id === mentions[0].id).user;
    member = cache["users"].find(u => u.discordId === user.id);
    
    if (!member) {
        msg.channel.send(createEmbed(`❌ Something went wrong`, [{ title: '\_\_\_', content: 'Apparently, according to Discord this user doesn\'t exist. Reset the client or something.' }]));
        msg.channel.stopTyping();
        return;
    }
    
    const punish = cache["options"].find(option => option.option === 'description_punish')
        ? chooseRandom(cache["options"].find(option => option.option === 'description_punish').value)
        : 'I wet myself at night. :pensive:';
    if (member.punished === true) {
        member = {
            ...member,
            punished: false,
            description: null
        };
        msg.channel.send(createEmbed(`:information_source: Member ${user.username} unpunished`, [{ title: '\_\_\_', content: 'They can go back to writing cringy descriptions about themselves.' }]));
    }
    else {
        member = {
            ...member,
            punished: true,
            description: punish
        }
        msg.channel.send(createEmbed(`:information_source: Member ${user.username} punished`, [{ title: '\_\_\_', content: 'No more nasty descriptions from that one.' }]));
    }
    msg.channel.stopTyping();
    upsertOne('vikbot', 'users', { discordId: member.discordId }, member, err => err && log.WARN(err));
}