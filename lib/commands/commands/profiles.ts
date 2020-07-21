import Discord from 'discord.js';
import axios from 'axios';
import v4 from 'uuid/v4';
import { orderBy } from 'lodash';
import { log } from '../../log';
import { initData, descriptionChange } from '../../events';
import { cache } from '../../storage/cache';
import { upsertUser, findUserByDiscordId, findAllGuildMembers } from '../../storage/db';
import { extractNicknameAndServer, createEmbed, removeKeyword, justifyToRight, justifyToLeft, replaceAll, modifyInput, extractArguments, toMMSS } from '../../helpers';
import { getSummonerId, getRealm } from './riot';
import config from '../../../config.json';
import { format as sprintf } from 'util'

const timeout = 900000;

const verifyCode = async (nickname:string, server:string, uuid:string, msg:Discord.Message ) => {
    msg.channel.startTyping();
    const playerId = await getSummonerId(nickname, server);
    const realm = getRealm(server);
    const url = `https://${realm}.api.riotgames.com/lol/platform/v4/third-party-code/by-summoner/${playerId}?api_key=${config.RIOT_API_TOKEN}`;
    const continueVerifying = async (verificationCode) => {
        if (!verificationCode) {
            log.INFO(`user ${msg.author.username} failed to register with account ${nickname}, ${server} - ${url} - no data returned`);
            log.INFO(JSON.stringify(verificationCode));
            msg.author.send(createEmbed(`❌ Verification failed`, [{ title: '\_\_\_', content: `That's probably a Riot's API error. Try again a bit later.` }]));
            msg.channel.stopTyping();
            return;
        }
        if (verificationCode && uuid !== verificationCode.data) {
            log.INFO(`user ${msg.author.username} failed to register with account ${nickname}, ${server} - ${url} - incorrect code (${verificationCode.data})`);
            msg.author.send(createEmbed(`❌ Incorrect verification code`, [{ title: '\_\_\_', content: `The verification code you've set is incorrect, try again.\nIf this happens consistently, reset the League client.` }]));
            msg.channel.stopTyping();
            return;
        }
        const { tier, rank } = await getTierAndDivision(msg, nickname, server);
        const mastery = await getMastery(msg, nickname, server);
        let userData = {};

        const oldData = findUserByDiscordId(msg.author.id);
        
        if (oldData) {
            const isThisAccountRegistered = oldData["accounts"].find(account => account.id === playerId);
            const account = {
                server: server.toUpperCase(),
                id: playerId,
                tier,
                rank,
                mastery
            };
            if (isThisAccountRegistered) {
                msg.author.send(createEmbed(`❌ This account is already registered`, [{ title: '\_\_\_', content: `This account is already registered.` }]));
                msg.channel.stopTyping();
                return;
            }
            userData = oldData;
            userData["accounts"]
                ? userData["accounts"].push(account)
                : userData["accounts"] = [ account ]
        }
        else {
            userData = {
                discordId: msg.author.id,
                updated: Date.now(),
                accounts: [{
                    server: server.toUpperCase(),
                    id: playerId,
                    tier,
                    rank,
                    mastery
                }],
                membership: {}
            };
        }
        updateRankRoles(msg, userData);
        try {
          await upsertUser(msg.author, userData as any);
          await msg.author.send(
            createEmbed(`✅ Profile verified succesfully`, [
              {
                title: "___",
                content: `To check your profile, you can use \`\`!profile\`\` command.`,
              },
            ])
          );
        } catch {
          await msg.author.send(
            createEmbed(`❌ Cannot verify user`, [
              {
                title: "___",
                content: `Getting user's data failed, probably due to problem with database. Try again later.`,
              },
            ])
          );
        } finally {
          msg.channel.stopTyping();
        }
    }

    await axios(url)
        .then(continueVerifying)
        .catch(err => {
            log.INFO(`user ${msg.author.username} failed to register with account ${nickname}, ${server} - ${url} - axios error`);
            log.WARN(err);
            msg.author.send(createEmbed(`❌ Cannot get verification code`, [{ title: '\_\_\_', content: `Getting 3rd party code failed.` }]));
            msg.channel.stopTyping();
            return;
        })
}

const updateRankRoles = (msg:Discord.Message, userData) => {
    const ranksWeighted = cache["options"].find(option => option.option === 'rankRoles').value;
    let highestTier = 'UNRANKED';
    
    userData["accounts"].map(account => {
        const rW = ranksWeighted.find(rankWeighted => rankWeighted.rank.toLowerCase() === account.tier.toLowerCase())
        const rHT = ranksWeighted.find(rankWeighted => rankWeighted.rank.toLowerCase() === highestTier.toLowerCase())
        if (rW.weight < rHT.weight)
            highestTier = rW.rank;
    });

    const roleToAdd = msg.guild.roles.find(role => role.name.toLowerCase() === highestTier.toLowerCase());
    const rolesToRemove = msg.member.roles.filter(role => ranksWeighted.find(r => r.rank === role.name && r.rank !== roleToAdd.name));
    
    if (rolesToRemove.size > 0)
        msg.member.removeRoles(rolesToRemove)
            .catch(err => log.WARN(err));
    if (roleToAdd)
        msg.member.addRole(roleToAdd)
            .catch(err => log.WARN(err));
}

const getTierAndDivision = async (msg:Discord.Message, nickname:string, server:string, _playerId?:any) => {
    const playerId = _playerId ? _playerId : await getSummonerId(nickname, server);
    const realm = getRealm(server);
    const url = `https://${realm}.api.riotgames.com/lol/league/v4/entries/by-summoner/${playerId}?api_key=${config.RIOT_API_TOKEN}`;
    const userLeagues:any = await axios(url)
        .catch(err => {
            log.INFO(`failed to get user's ${msg.author.username} tier/division (${nickname}, ${server}) - ${url}`);
            log.WARN(err);
            return;
        })
    if (!userLeagues || !userLeagues.data) {
        msg.channel.send(createEmbed(`❌Cannot get user's data`, [{ title: '\_\_\_', content: `Getting user's rank data failed. Try again later.` }]));
        msg.channel.stopTyping();
        return { tier: null, rank: null };
    }
    const soloQ = userLeagues.data.find(queue => queue.queueType === 'RANKED_SOLO_5x5');
    const soloQRank = soloQ 
        ? { tier: soloQ.tier, rank: soloQ.rank }
        : { tier: 'UNRANKED', rank: 'UNRANKED' }
    return soloQRank;
}

const getMastery = async (msg:Discord.Message, nickname:string, server:string, _playerId?:any) => {
    const playerId = _playerId ? _playerId : await getSummonerId(nickname, server);
    const realm = getRealm(server);
    const url = `https://${realm}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${playerId}/by-champion/112?api_key=${config.RIOT_API_TOKEN}`;
    const userMastery:any = await axios(url)
        .catch(err => {
            log.INFO(`failed to get user's ${msg.author.username} mastery (${nickname}, ${server}) - ${url}`);
            log.WARN(err);
            return null;
        })
    if (!userMastery || !userMastery.data) {
        msg.channel.send(createEmbed(`❌Cannot get user's data`, [{ title: '\_\_\_', content: `Getting user's mastery failed. Try again later.` }]));
        msg.channel.stopTyping();
    }
    const masteryData = userMastery && userMastery.data 
        ? {
            points: userMastery.data.championPoints,
            chest: userMastery.data.chestGranted,
            level: userMastery.data.championLevel,
            lastPlayed: userMastery.data.lastPlayTime
        }
        : {
            points: null,
            chest: null, 
            level: null,
            lastPlayed: null
        }
    return masteryData;
}

export const profile = async (msg:Discord.Message) => {
    msg.channel.startTyping();
    
    let viktorMastery = 0;
    let lastViktorGame = 0;
    const mentions = [ ...msg.mentions.users.values() ];
    const args = extractArguments(msg);
    if (mentions.length === 0 && args.length !== 0) {
        msg.channel.send(createEmbed(`:information_source:  Unoptimal command use`, [{ title: '\_\_\_', content: 
        `There are two ways to use this command and yours was none of them:\n\n`+
        `- \`\`!profile\`\` - that way you see your own profile,\n`+
        `- \`\`!profile @mention\`\` - that way you see profile of the mentioned person (use with caution as it pings them)`
        }]));
        msg.channel.stopTyping();
        return;
    }
    const user:Discord.User = mentions.length === 0 ? msg.author : msg.guild.members.find(member => member.id === mentions[0].id).user;
    const members = await findAllGuildMembers(msg.guild);
    const memberships = members.map(user => {
        const membership = user.membership.find(member => member.serverId === msg.guild.id)
        return {
            id: user.discordId,
            messageCount: membership?.messageCount ?? 0
        }
    });

    const sorted = orderBy(memberships, ['messageCount'], ['desc']);
    const userData = await findUserByDiscordId(user.id);
    if (user.id !== cache["bot"].user.id) {
        if (!userData || !userData["membership"] || !userData["membership"].find(s => s.serverId === msg.guild.id)) {
            if (user.id === msg.author.id) {
                // msg.channel.send(createEmbed(`:information_source: You didn't register yet`, [{ title: '\_\_\_', content: `Use the \`\`!register <IGN> | <server>\`\` command to create your profile.` }]));
                msg.channel.send(createEmbed(`:information_source: Cannot find your data in database`, [{ title: '\_\_\_', content: `Wait a bit and try again later.` }]));
                msg.channel.stopTyping();
                return;
            }
            else {
                // msg.channel.send(createEmbed(`:information_source: This user didn't register yet`, [{ title: '\_\_\_', content: `You cannot see profile of this user as they didn't register yet.` }]));
                msg.channel.send(createEmbed(`:information_source: Cannot find ${user.username}'s data in database`, [{ title: '\_\_\_', content: 
                    `It's possible that they are inactive and Vikbot didn't pick them up yet. `+
                    `It also might be a bot account.` }]));
                msg.channel.stopTyping();
                return;
            }
        }
    }

    const embed = new Discord.RichEmbed()
        .setColor('FDC000')
        .setThumbnail(user.avatarURL)
        .setFooter(`Last profile's update`)
        // @ts-ignore:next-line
        .setTimestamp(new Date(userData.updated).toLocaleString())
        .setTitle(`:information_source: ${user.username}'s profile`);

    for (const account of sorted) {
        const {
            name,
            server,
            rank,
            tier = "UNKNOWN",
            opgg = `https://${server}.op.gg/summoner/userName=${modifyInput(name)}`,
          } = account;
          const content = sprintf("IGN: [%s](%s)\nRank: **%s** %s", name, opgg, tier, rank === "UNRANKED" ? "" : rank);
          viktorMastery = account.mastery.points
            ? viktorMastery + account.mastery.points
            : viktorMastery;
          lastViktorGame =
            lastViktorGame > account.mastery.lastPlayed
              ? lastViktorGame
              : account.mastery.lastPlayed;
          embed.addField(account.server, content, true);
    }

    embed.addField(
      "Description",
      userData?.description
        ? userData.description
            .replace(replaceAll("MEMBER_NICKNAME"), user.username)
            .replace(replaceAll("<br>"), "\n")
        : `This user has no description yet.`,
      false
    );
    if (userData?.accounts.length ?? 0 > 0) {
      embed.addField(
        "Viktor mastery",
        viktorMastery ? viktorMastery : "UNKNOWN",
        true
      );
      embed.addField(
        "Last Viktor game",
        lastViktorGame
          ? lastViktorGame === 0
            ? "never >:C"
            : new Date(lastViktorGame).toLocaleDateString()
          : "UNKNOWN",
        true
      );
    }
    const memberData = userData?.membership
      ? userData.membership.find((member) => member.serverId === msg.guild.id)
      : null;
    if (memberData) {
      const messagesPerDay = (
        memberData.messageCount /
        ((Date.now() - memberData.joined) / 86400000)
      ).toFixed(3);
      const userIndex: number = members.findIndex((u) => u.id === user.id);
      embed.addField(
        "Member since",
        memberData.joined < memberData.firstMessage
          ? new Date(memberData.joined).toUTCString()
          : new Date(memberData.firstMessage).toUTCString(),
        false
      );
      embed.addField("Messages written", memberData.messageCount, true);
      embed.addField("Messages per day", messagesPerDay, true);
      embed.addField(
        "# on server",
        userIndex !== -1 ? `#${userIndex + 1}` : "?",
        true
      );
    }
    msg.channel.send(embed);
    msg.channel.stopTyping();
}

export const description = async (msg:Discord.Message) => {
    msg.channel.startTyping();

    let description = removeKeyword(msg).trim();
    let userData = await findUserByDiscordId(msg.author.id);

    if (userData?.punished) {
        msg.channel.send(createEmbed(`❌ You are banned from writing own descriptions`, [{ title: '\_\_\_', content: `Apparently in the past evil mods decided that you aren't responsible enough to write your own description. Shame on you.` }]));
        return;
    }
    if (description.length === 0) {
        description = 'This user is a dummy who cannot use simple bot commands, but what do I expect from League players.';
        msg.channel.send(createEmbed(`❌ You forgot description`, [{ title: '\_\_\_', content: `This command requires adding a description. Since you forgot to add it, I've wrote one for you. Have fun.` }]));
    }
    if (description.length > 1024) {
        description = `${description.substring(0, 1017)} (...)`;
        msg.channel.send(createEmbed(`:information_source: Your description is too long`, [{ title: '\_\_\_', content: `Description must not exceed 1024 characters, so I've cut it down a bit.` }]));
    }

    if (!userData) 
        userData = initData(null, msg.author.id, msg);
    userData.description = description;

    try {
      await upsertUser(msg.author, userData);
    } catch (err) {
      log.WARN(err);
      msg.channel.send(
        createEmbed(`❌Something went wrong`, [
          {
            title: "___",
            content: `Something went wrong. Tell Arcyvilk to check logs.`,
          },
        ])
      );
    }

    descriptionChange(msg);
    msg.channel.send(createEmbed(`✅ Description updated succesfully`, [{ title: '\_\_\_', content: `To check your profile, you can use \`\`!profile\`\` command.`}]));
    msg.channel.stopTyping();
}

export const update = async (msg:Discord.Message) => {
    const member = await findUserByDiscordId(msg.author.id);
    if (!member) {
        msg.channel.send(createEmbed(`:information_source: You didn't register yet`, [{ title: '\_\_\_', content: `Use the \`\`!register <IGN> | <server>\`\` command to create your profile.` }]));
        msg.channel.stopTyping();
        return;
    }
    const lastUpdated = Date.now() - member.updated;
    const timeoutUpdate = 3600000;
    if (lastUpdated < timeoutUpdate) {
        const embed = new Discord.RichEmbed()
            .setFooter(`Last profile update`)
            .setTimestamp(new Date(member.updated))
            .setTitle(`:information_source: Profile recently updated`)
            .setColor('0xFDC000');
        embed.addField('\_\_\_', `Wait ${toMMSS(timeoutUpdate - lastUpdated)} before updating again.`, false)
        msg.channel.send(embed);
        msg.channel.stopTyping();
        return;
    }
    const updateAccounts = async (index:number) => {
        if (!member.accounts[index])
            return finalize();
        const account = member.accounts[index];
        const { tier, rank } = await getTierAndDivision(msg, '', account.server, account.id);
        const mastery = await getMastery(msg, '', account.server, account.id);
        const updatedAcc = { ...account };
        updatedAcc.tier = tier ? tier : updatedAcc.tier;
        updatedAcc.rank = rank ? rank : updatedAcc.rank;
        updatedAcc.mastery = mastery.lastPlayed ? mastery : updatedAcc.mastery;
        member.accounts[index] = updatedAcc;
        updateAccounts(index + 1);
    }

    const finalize = async () => {
      updateRankRoles(msg, member);
      member.updated = Date.now();
      try {
        await upsertUser(msg.author, member);

        await msg.channel.send(
          createEmbed(`✅ Profile updated succesfully`, [
            {
              title: "___",
              content: `To check your profile, you can use \`\`!profile\`\` command.`,
            },
          ])
        );
      } catch {
        await msg.channel.send(
          createEmbed(`❌ Cannot update user`, [
            {
              title: "___",
              content: `Updating user's data failed. Try again later.`,
            },
          ])
        );
      } finally {
        msg.channel.stopTyping();
      }
    };

    updateAccounts(0);
}

export const topmembers = async (msg:Discord.Message) => {
    const count = cache["options"].find(option => option.option === 'topMembers')
        ? cache["options"].find(option => option.option === 'topMembers').value
        : 10;
    const guildMembers = await findAllGuildMembers(msg.guild);
    const counts = guildMembers.map((user) => {
        const membership = user.membership.find(m => m.serverId === msg.guild.id);
        return {
            id: user.discordId,
            messageCount: membership?.messageCount ?? 0
        }
    });

    const sorted = orderBy(counts, ['messageCount'], ['desc']);
    let content = '';
    sorted.map((member, index) => index < count 
        ? content += `\`\`#${justifyToLeft((index+1).toString(), 2)} - ${justifyToRight(member.messageCount.toString(), 6)} msg\`\` - ${msg.guild.members.find(m => m.id === member.id).user.username}\n` 
        : {})
    const embed = createEmbed(`🏆 Top ${count} members`, [{ title: '\_\_\_', content }])
    msg.channel.send(embed);
}

export const register = async (msg:Discord.Message) => {
    const { nickname, server } = extractNicknameAndServer(msg);
    const oldData = await findUserByDiscordId(msg.author.id);
    const maxAccounts = cache["options"].find(option => option.option === 'maxAccounts')
        ? cache["options"].find(option => option.option === 'maxAccounts').value
        : 2;
    const uuid = `VIKBOT-${v4()}`;
    
    if (!nickname || !server)
        return;
    if (oldData && oldData.accounts && oldData.accounts.length >= maxAccounts) {
        msg.channel.send(createEmbed(`❌ You registered maximum amount of accounts`, [{ title: '\_\_\_', content: `The maximum number of accounts you can register is **${maxAccounts}**.` }]))
        return;
    }

    const embed = new Discord.RichEmbed()
        .setColor('FDC000')
        .setFooter(`Your code expires at ${(new Date(Date.now() + timeout)).toLocaleTimeString()}`)
        .setTitle(`Your unique verification code!`)
        .addField('\_\_\_', `\`\`${uuid}\`\`
            \nCopy the above code, login into your ${nickname} account on server ${server}, go into Settings -> Verification, paste the code in the text box and click "Send".
            \nAfter it's done, react with the :white_check_mark:.
            \n[Picture visualizing it step-by-step](https://i.imgur.com/4GsXTQC.png)`);
    
    msg.author.send(embed)
        .then(sentEmbed => {
            msg.react('📩')
            const reactions = [ '✅', '❌' ];
            const filter = (reaction, user) => msg.author.id === user.id && (reaction.emoji.name === '❌' || reaction.emoji.name === '✅');
            const iterateReactions = (index:number) => {
                if (index >= reactions.length)
                    return;
                // @ts-ignore:next-line
                sentEmbed.react(reactions[index]);
                setTimeout(() => iterateReactions(index + 1), 500);
            }
            iterateReactions(0);
            
            // @ts-ignore:next-line
            sentEmbed.awaitReactions(filter, {
                time: timeout,
                maxEmojis: 1
            })
            .then(collected => {
                collected = collected.map(col => ({
                    name: col.emoji.name,
                    message: col.message
                }))[0];
                if (collected && collected.name === '✅')
                    verifyCode(nickname, server, uuid, msg)
                else {
                    log.INFO(`user ${msg.author.username} timeouted while registering ${nickname} [${server}]`);
                    msg.author.send(createEmbed(`:information_source: Profile registering aborted`, [{ title: '\_\_\_', content: `You can do it some other time.` }]));
                    msg.channel.stopTyping();
                }
            })
            .catch(e => log.WARN(e))
        })
        .catch(err => {
            msg.channel.send(createEmbed(':warning: I am unable to reply to you', [{ title: '\_\_\_', content: `This command sends the reply to your DM, and it seems you have DMs from members of this server disabled.
            \nTo be able to receive messages from me, go to \`\`User Settings => Privacy & Safety => Allow direct messages from server members\`\` and then resend the command.` }]
            ));
            msg.channel.stopTyping();
        });
    return;
}

export const unregister = async (msg:Discord.Message) => {
    msg.channel.startTyping();
    const { nickname, server } = extractNicknameAndServer(msg);
    const realm = getRealm(server);
    const playerId = await getSummonerId(nickname, server);
    const oldData = await findUserByDiscordId(msg.author.id);

    if (!nickname || !server) {
        msg.channel.stopTyping();
        return;
    }
    if (!playerId || !realm) {
        msg.channel.send(createEmbed('❌ Incorrect nickname or server', [{ title: '\_\_\_', content: 'Check if the data you\'ve provided is correct.' }]));
        msg.channel.stopTyping();
        return;
    }
    if (!oldData || !oldData.accounts) {
        msg.channel.send(createEmbed(`:information_source: Provided account isn't registered`, [{ title: '\_\_\_', content: `This account was never registered in the first place.` }]));
        msg.channel.stopTyping();
        return;
    }
    const newData = { ...oldData };
    newData.accounts = oldData.accounts.filter(account => account.id !== playerId);
    if (oldData.accounts.length === newData.accounts.length) {
        msg.channel.send(createEmbed(`:information_source: Provided account isn't registered`, [{ title: '\_\_\_', content: `This account was never registered in the first place.` }]));
        msg.channel.stopTyping();
        return;
    }
    updateRankRoles(msg, newData);

    try {
      await upsertUser(msg.author, newData);
      await msg.channel.send(
        createEmbed(`✅ Account unregistered succesfully`, [
          {
            title: "___",
            content: `To check your profile, you can use \`\`!profile\`\` command.`,
          },
        ])
      );
    } catch (err) {
      log.WARN(err);
    } finally {
      msg.channel.stopTyping();
    }
}