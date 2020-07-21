import Discord from 'discord.js';
import { createEmbed, extractArguments, removeKeyword } from '../../helpers';
import { cache } from '../../storage/cache';
import { findOption } from '../../storage/db';

const returnRoleID = (roleName, member) => {
    const role = member.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase()).id;
    return role;
};
const roleExists = (roleName, member) => {
    return member.guild.roles.some(role => role.name.toLowerCase() === roleName.toLowerCase());
};
const roleisAssignable = async (roleName) => {
  const roles = await findOption("assignableRoles");
  return (
    roles?.find((role) => role.toLowerCase() === roleName.toLowerCase()) !==
    undefined
  );
};

const userHasRole = (roleName, member) => {
    if (member.roles.has(returnRoleID(roleName, member)))
        return true;
    return false;
};

const requestWasSendInApropriateChannel = async (msg:Discord.Message) => {
    const roomRoles = await findOption("room_roles") ?? [];
    const guildRole = roomRoles.find(role => role.guild === msg.guild.id);
    return guildRole?.id === msg.channel.id;
};

const specialRoleRequested = async (roleName: string, msg: Discord.Message) => {
  const name = roleName.toLowerCase();
  const [jokeRoles, rankRoles, membershipRoles, modRoles] = await Promise.all([
    findOption("jokeRoles"),
    findOption("rankRoles"),
    findOption("membershipRoles"),
    findOption("modRoles"),
  ]);

  const jokeRole = jokeRoles?.find((r) => r.toLowerCase() === name);
  const rankRole = rankRoles?.find((r) => r.rank.toLowerCase() === name);
  const membershipRole = membershipRoles?.find(
    (r) => r.name.toLowerCase() === name
  );
  const modRole = modRoles?.find((r) => r.toLowerCase() === name);

  if (jokeRole) {
    msg.channel.send("Indeed. You are.");
    return true;
  }

  if (membershipRole) {
    const embed = createEmbed(
      ":information_source: This is not how membership roles are assigned",
      [
        {
          title: "___",
          content:
            `You can unlock membership roles for active participation in the server.\n\n` +
            `- **Junior Assistant** for initial participation¹\n` +
            `- **Hextech Progenitor** for active participation¹ of at least 4 months\n` +
            `- **Arcane Android** for active participation¹ of at least 1 year\n\n` +
            `¹ participation: a certain amount of messages`,
        },
      ]
    );
    msg.channel.send(embed);
    return true;
  }

  if (rankRole) {
    const embed = createEmbed(
      ":information_source: This is not how rank roles are assigned",
      [
        {
          title: "___",
          content:
            `Rank roles are assigned using the \`\`!register IGN|server\`\` command - You can register unlimited amount of accounts that belong to you.\n` +
            `Doing so unlocks the \`\`!profile\`\` command for you, as well as gives you access to the #get_vikmains_advice room.\n` +
            `You will also get a colour based off your *Ranked Solo/Duo* rank - Ranked Flex, Ranked 3v3, Teamfight Tactics etc. aren't taken into account.`,
        },
      ]
    );
    msg.channel.send(embed);
    return true;
  }

  if (modRole) {
    msg.channel.send("Heh, you'd want it to be so simple.");
    return true;
  }
  return false;
};

export const iam = async (msg:Discord.Message) => {
    const roleName = removeKeyword(msg);
    const member = msg.member;
    const roomRoles = await findOption("room_roles")
    const appropiateChannel = roomRoles?.find(s => s.guild === msg.guild.id)?.id;
    
    if (!(await requestWasSendInApropriateChannel(msg)) && appropiateChannel)
        return msg.channel.send(`You can be anything you want, I'm not giving you role outside the <#${appropiateChannel}> room.`);
    if (await specialRoleRequested(roleName, msg))
        return;
    if (!roleName)
        return msg.channel.send(`Excuse me, you are _what?_`);
    if (!roleExists(roleName, member))
        return msg.channel.send(`Role **[${roleName.toUpperCase()}]** doesn't exist.`);
    if (!(await roleisAssignable(roleName)))
        return msg.channel.send(`Role **[${roleName.toUpperCase()}]** cannot be self-assigned.`);
    if (userHasRole(roleName, member))
        return msg.channel.send(`You already have the **[${roleName.toUpperCase()}]** role.`);

    msg.member.addRole(returnRoleID(roleName, member))
        .then(success => msg.channel.send(`Role **[${roleName.toUpperCase()}]** assigned to ${member.user.username} with utmost efficiency.`))
        .catch(error => {
            msg.channel.send(`Failed to assign the **[${roleName.toUpperCase()}]** role.`);
            console.log(error);
        });
    return;
}
export const iamnot = async (msg:Discord.Message) => {
    const roleName = extractArguments(msg)[0];
    const member = msg.member;
    
    if (!roleName)
        return msg.channel.send(`Excuse me, you aren't _what?_`);
    if (!roleExists(roleName, member))
        return msg.channel.send(`Role **[${roleName.toUpperCase()}]** doesn't exist.`);
    if (!(await roleisAssignable(roleName)))
        return msg.channel.send(`Role **[${roleName.toUpperCase()}]** cannot be self-unassigned.`);
    if (!userHasRole(roleName, member))
        return msg.channel.send(`You don't have the **[${roleName.toUpperCase()}]** role.`);
    if (!(await requestWasSendInApropriateChannel(msg))) {
      const roles = await findOption("room_roles")
      const channel = roles?.find(g => g.guild === msg.guild.id);
      if (channel === undefined) {
        // This should probably be logged
        return;
      }

      return msg.channel.send(`I'm not doing that outside the <#${channel}> room.`);
    }

    msg.member.removeRole(returnRoleID(roleName, member))
        .then(success => msg.channel.send(`Role **[${roleName.toUpperCase()}]** removed from ${member.user.username} with utmost efficiency.`))
        .catch(error => {
            msg.channel.send(`Failed to remove the **[${roleName.toUpperCase()}]** role.`);
            console.log(error);
        });
    return;
}
export const roles = async (msg:Discord.Message) => {
    msg.channel.startTyping();
    const existingRoles = msg.guild.roles.array().map(role => role.name);
    const assignableRoles = await findOption("assignableRoles") ?? [];
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