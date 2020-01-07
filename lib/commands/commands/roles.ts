import Discord from 'discord.js';
import { log } from '../../log';
import { createEmbed, extractArguments } from '../../helpers';
import { updateCache } from '../../storage/db';
import { cache } from '../../storage/cache';
import config from '../../../config.json';

const returnRoleID = (roleName, member) => {
    const role = member.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase()).id;
    return role;
};
const roleExists = (roleName, member) => {
    return member.guild.roles.some(role => role.name.toLowerCase() === roleName.toLowerCase());
};
const roleisAssignable = (roleName) => {
    const assignableRoles = cache["options"].find(option => option.option === 'assignableRoles')
        ? cache["options"].find(option => option.option === 'assignableRoles').value
        : null;
    if (!assignableRoles || !assignableRoles.find(role => role.toLowerCase() === roleName.toLowerCase()))
        return false;
    return true;
}
const userHasRole = (roleName, member) => {
    if (member.roles.has(returnRoleID(roleName, member)))
        return true;
    return false;
};
const requestWasSendInApropriateChannel = (msg:Discord.Message) => {
    const room_roles = cache["options"].find(option => option.option === 'room_roles')
        ? cache["options"].find(option => option.option === 'room_roles').value
        : null;
    if (room_roles == msg.channel.id)
        return true;
    return false;
};

export const iam = (msg:Discord.Message) => {
    const roleName = extractArguments(msg)[0];
    const member = msg.member;
    
    if (!roleName)
        return msg.channel.send(`Excuse me, you are _what?_`);
    if (!roleExists(roleName, member))
        return msg.channel.send(`Role **[${roleName.toUpperCase()}]** doesn't exist.`);
    if (!roleisAssignable(roleName))
        return msg.channel.send(`Role **[${roleName.toUpperCase()}]** cannot be self-assigned.`);
    if (userHasRole(roleName, member))
        return msg.channel.send(`You already have the **[${roleName.toUpperCase()}]** role.`);
    if (!requestWasSendInApropriateChannel(msg))
        return msg.channel.send(`You can be anything you want, I'm not giving you role outside the <#${cache["options"].find(option => option.option === 'room_roles').value}> room.`);

    msg.member.addRole(returnRoleID(roleName, member))
        .then(success => msg.channel.send(`Role **[${roleName.toUpperCase()}]** assigned to ${member.user.username} with utmost efficiency.`))
        .catch(error => {
            msg.channel.send(`Failed to assign the **[${roleName.toUpperCase()}]** role.`);
            console.log(error);
        });
    return;
}
export const iamnot = (msg:Discord.Message) => {
    const roleName = extractArguments(msg)[0];
    const member = msg.member;
    
    if (!roleName)
        return msg.channel.send(`Excuse me, you aren't _what?_`);
    if (!roleExists(roleName, member))
        return msg.channel.send(`Role **[${roleName.toUpperCase()}]** doesn't exist.`);
    if (!roleisAssignable(roleName))
        return msg.channel.send(`Role **[${roleName.toUpperCase()}]** cannot be self-unassigned.`);
    if (!userHasRole(roleName, member))
        return msg.channel.send(`You don't have the **[${roleName.toUpperCase()}]** role.`);
    if (!requestWasSendInApropriateChannel(msg))
        return msg.channel.send(`I'm not doing that outside the <#${cache["options"].find(option => option.option === 'room_roles').value}> room.`);

    msg.member.removeRole(returnRoleID(roleName, member))
        .then(success => msg.channel.send(`Role **[${roleName.toUpperCase()}]** removed from ${member.user.username} with utmost efficiency.`))
        .catch(error => {
            msg.channel.send(`Failed to remove the **[${roleName.toUpperCase()}]** role.`);
            console.log(error);
        });
    return;
}
export const roles = (msg:Discord.Message) => {
    msg.channel.startTyping();
    const existingRoles = msg.guild.roles.array().map(role => role.name);
    const assignableRoles = cache["options"].find(option => option.option === 'assignableRoles')
        ? cache["options"].find(option => option.option === 'assignableRoles').value
        : null;
    const availableRoles:string[] = [];
    
    if (!existingRoles || !assignableRoles) {
        msg.channel.stopTyping();
        return;
    }
    assignableRoles.map((assignableRole:string) => {
        existingRoles.find(existingRole => existingRole.toLowerCase() === assignableRole.toLowerCase())
        && availableRoles.push(`- ${assignableRole}`)
    })

    const embed = createEmbed('Self-assignable roles', [{ title: '\_\_\_', content: availableRoles.join('\n')}])
    msg.channel.stopTyping();
    msg.channel.send(embed);
}
export const membership = (msg:Discord.Message) => {
    msg.channel.send('WIP')
}
export const topmembers = (msg:Discord.Message) => {
    msg.channel.send('WIP')
}
