import Discord from "discord.js";
import { orderBy } from 'lodash';
import moment from 'moment';
import { log } from './log';
import { upsertOne } from './storage/db';
import { createEmbed, toDDHHMMSS, removeKeyword } from './helpers';
import { cache } from './storage/cache';

const sendLog = (guild:any, embed:Discord.RichEmbed, room:string) => {
    const room_log = cache["options"].find(option => option.option === room)
        ? cache["options"].find(option => option.option === room).value.find(g => g.guild === guild)
            ? cache["options"].find(option => option.option === room).value.find(g => g.guild === guild).id
            : null
        : null;
    if (room_log) {
        const channel = cache["bot"].channels.get(room_log);
        if (channel)
        channel.send(embed)
            .catch(err => log.WARN(`Something went wrong. ${ err }`))
    }
}
const sendGlobalLog = (embed:Discord.RichEmbed, guild:Discord.Guild) => {
    const room = 'room_global';
    const room_log = cache["options"].find(option => option.option === room)
        ? cache["options"].find(option => option.option === room).value
        : null;

    embed.addField('Guild name', guild.name, true)
    embed.addField('Guild id', guild.id, true)

    if (room_log) {
        const channel = cache["bot"].channels.get(room_log);
        if (channel)
        channel.send(embed)
            .catch(err => log.WARN(`Something went wrong. ${ err }`))
    }
}

export const msgEdit = (oldMsg:Discord.Message, newMsg:Discord.Message) => { 
    if (oldMsg.channel.type === 'dm' || oldMsg.author.bot || oldMsg.content === newMsg.content || !oldMsg.content)
        return;
    const oldTimestamp = new Date(oldMsg.createdTimestamp);
    const newTimestamp = new Date();
    const log = createEmbed(`:clipboard: MESSAGE EDITED`, [
        { title: `Author`, content: `${oldMsg.author.username}#${oldMsg.author.discriminator}`, inline: true},
        { title: `Channel`, content: `<#${oldMsg.channel.id}>`, inline: true},
        { title: `Old message`, content: oldMsg.content, inline: false},
        { title: `New message`, content: newMsg.content, inline: false},
        { title: `Created at`, content: moment(oldTimestamp).format("MMMM Do YYYY, HH:mm:ss"), inline: true},
        { title: `Edited at`, content: moment(newTimestamp).format("MMMM Do YYYY, HH:mm:ss"), inline: true}
    ], '83C4F2');
    const guild = oldMsg.guild.id;
    sendLog(guild, log, 'room_log_msgs');
}

export const msgDelete = (msg:Discord.Message) => { 
    if (msg.channel.type === 'dm' || msg.author.bot)
        return;
    const oldTimestamp = new Date(msg.createdTimestamp);
    const newTimestamp = new Date();
    const attachments = [...msg.attachments.values()].length != 0
        ? [...msg.attachments.values()].map((att:any) => att.proxyURL).join(' ')
        : 'none';
    const content = msg.content ? msg.content : '_empty message or picture_';
    const log = createEmbed(`:no_mobile_phones: MESSAGE DELETED`, [
        { title: `Author`, content: `${msg.author.username}#${msg.author.discriminator}`, inline: true },
        { title: `Channel`, content: `<#${msg.channel.id}>`, inline: true },
        { title: `Content`, content: content, inline: false },
        { title: `Attachments`, content: attachments, inline: false },
        { title: `Created at`, content: moment(oldTimestamp).format("MMMM Do YYYY, HH:mm:ss"), inline: true },
        { title: `Deleted at`, content: moment(newTimestamp).format("MMMM Do YYYY, HH:mm:ss"), inline: true}
    ], 'C70000');
    const guild = msg.guild.id;
    sendLog(guild, log, 'room_log_msgs');
}

export const userJoin = (member:Discord.GuildMember) => { 
    const log = createEmbed(`:man: USER JOINS`, [
        { title: `User`, content: `${member.user.username}#${member.user.discriminator}`, inline: false },
        { title: `Joined at`, content: moment(member.joinedAt.toISOString()).format("MMMM Do YYYY, HH:mm:ss"), inline: true }
    ], '51E61C');
    const guild = member.guild.id;
    sendLog(guild, log, 'room_log_users');

    if (member.user.bot)
        return;
    const returningMember = cache["users"].find(user => user.discordId === member.id);
    if (!returningMember)
        upsertOne('vikbot', 'users', { discordId: member.id }, initData(member), err => 
            // @ts-ignore:next-line
            err && log.WARN(err));
    else 
        handleUserNotInDatabase(member);
}

export const userLeave = (member:Discord.GuildMember) => { 
    const log = createEmbed(`:wave: USER LEAVES`, [
        { title: `User`, content: `${member.user.username}#${member.user.discriminator}`, inline: false },
        { title: `Was a member for`, content: toDDHHMMSS(member.joinedAt), inline: true },
        { title: `Leaves at`, content: moment(new Date().toISOString()).format("MMMM Do YYYY, HH:mm:ss a"), inline: true }
    ], 'C70000');
    const guild = member.guild.id;
    sendLog(guild, log, 'room_log_users');
}

export const descriptionChange = (msg:Discord.Message) => {
    const log = createEmbed(`✍️ USER CHANGES DESCRIPTION`, [
        { title: `User`, content: `${msg.member.user.username}#${msg.member.user.discriminator}`, inline: false },
        { title: `New description`, content: removeKeyword(msg), inline: false },
        { title: `Changed at`, content: moment(new Date().toISOString()).format("MMMM Do YYYY, HH:mm:ss a"), inline: false }
    ], '8442f5');
    const guild = msg.member.guild.id;
    sendLog(guild, log, 'room_log_users');
    sendGlobalLog(log, msg.member.guild);
}

export const botJoin = (guild:Discord.Guild) => { 
    const botLog = createEmbed(`:man: BOT JOINS GUILD`, [
        { title: `Joined at`, content: moment(Date.now()).format("MMMM Do YYYY, HH:mm:ss"), inline: true }
    ], '51E61C');
    log.INFO(`Great Herald joined ${guild.id} guild!`)
    sendGlobalLog(botLog, guild);
}

export const initData = (member:Discord.GuildMember|null, id?:any) => {
    // member = null means that they used to be part of Discord but aren't anymore
    return {
        discordId: member ? member.id : id,
        updated: Date.now(),
        accounts: [],
        membership: [{
            serverId: member ? member.guild.id : 0,
            messageCount: 0,
            firstMessage: 0,
            joined: member && member.joinedAt ? new Date(member.joinedAt).getTime() : Date.now()
        }]
    }
}

export const handleUserNotInDatabase = async (member:Discord.GuildMember) => {
    const update = (memberInDataBase) => {
        const memberIndex = memberInDataBase.membership.findIndex(m => m.serverId === member.guild.id);
        if (memberIndex !== -1) { // user is in the database and in the server
            memberInDataBase.membership[memberIndex].messageCount = memberInDataBase.membership[memberIndex].messageCount + 1;
                if (memberInDataBase.membership[memberIndex].joined === 0) 
                    memberInDataBase.membership[memberIndex].joined = Date.now();
                if (memberInDataBase.membership[memberIndex].firstMessage === 0) 
                    memberInDataBase.membership[memberIndex].firstMessage = Date.now();
                upsertOne('vikbot', 'users', { discordId: member.id }, memberInDataBase, err => err && log.WARN(err));
        }
        else { // user is in database but not in the server
            const serverData = {
                serverId: member.guild.id,
                messageCount: 1,
                firstMessage: Date.now(),
                joined: member.joinedAt ? new Date(member.joinedAt).getTime() : Date.now()
            }
            memberInDataBase.membership.push(serverData);
            upsertOne('vikbot', 'users', { discordId: member.id }, memberInDataBase, err => err && log.WARN(err));
        }
    }

    let memberInDataBase = cache["users"].find(user => user.discordId === member.id);
    if (!memberInDataBase) // user not in database at all
        update(initData(member));
    else // user in database
        update(memberInDataBase);
}

export const handlePossibleMembershipRole = async (msg:Discord.Message) => {
    const memberData = cache["users"].find(user => user.discordId === msg.author.id)
        ? cache["users"].find(user => user.discordId === msg.author.id).membership
            ? cache["users"].find(user => user.discordId === msg.author.id).membership.find(guild => guild.serverId === msg.guild.id)
            : null
        : null;
    const membershipRoles = cache["options"].find(option => option.option === 'membershipRoles')
        ? cache["options"].find(option => option.option === 'membershipRoles').value
        : null;

    if (!membershipRoles || !memberData)
        return;

    const memberMsgCount = memberData.messageCount;
    const memberJoinDate = memberData.joined < memberData.firstMessage 
        ? memberData.joined 
        : memberData.firstMessage;
    const neededRoles = orderBy(membershipRoles, ['weight'], ['desc'])
        .filter(role => 
            role.requirement.messages <= memberMsgCount 
            && role.requirement.time <= memberJoinDate)
        .filter((role, index) => role.persistent || index === 0) //only persistent roles and one with highest weight
    membershipRoles.map(mR => {
        if (neededRoles.find(nR => nR.name === mR.name) 
            && !msg.member.roles.some(r => r.name === mR.name)
            && msg.member.guild.roles.find(role => role.name.toLowerCase() === mR.name.toLowerCase())) {
                const roleToAdd = msg.member.guild.roles.find(role => role.name.toLowerCase() === mR.name.toLowerCase());
                msg.member.addRole(roleToAdd);
                informAboutPromotion(msg, mR);
        }
        else if (!neededRoles.find(nR => nR.name === mR.name) 
            && msg.member.roles.some(r => r.name === mR.name)
            && msg.member.guild.roles.find(role => role.name.toLowerCase() === mR.name.toLowerCase())) {
                const roleToRemove = msg.member.guild.roles.find(role => role.name.toLowerCase() === mR.name.toLowerCase());
                msg.member.removeRole(roleToRemove);
        }
    })
}

const informAboutPromotion = (msg:Discord.Message, role:any) => {
    const embedTitle:string = role.message.title
        .replace('MEMBER_USERNAME', msg.author.username)
        .replace('MEMBERSHIP_ROLE', role.name);
    const embedContent:string = role.message.content
        .replace('MEMBER_USERNAME', msg.author.username)
        .replace('MEMBERSHIP_ROLE', role.name)
        .replace('\\n', '\n')
    const embedColor:string = role.message.color;
    const embedIcon:string = role.message.icon;
    const embed = new Discord.RichEmbed()
        .setTitle(`${embedIcon} ${embedTitle}`)
        .setThumbnail(msg.author.avatarURL)
        .setColor(embedColor)
        .addField(`\_\_\_`, embedContent, false)
        .setFooter(`${embedIcon} Powered by Glorious Evolution`)
        .setTimestamp(new Date());
    msg.channel.send(embed);
}