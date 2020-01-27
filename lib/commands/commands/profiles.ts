import Discord from 'discord.js';
import axios from 'axios';
import v4 from 'uuid/v4';
import { log } from '../../log';
import { initData } from '../../events';
import { cache } from '../../storage/cache';
import { upsertOne } from '../../storage/db';
import { extractNicknameAndServer, createEmbed, removeKeyword, toDDHHMMSS } from '../../helpers';
import { getSummonerId, getRealm } from './riot';
import config from '../../../config.json';

const timeout = 30000;

const verifyCode = async (nickname:string, server:string, uuid:string, msg:Discord.Message ) => {
    const playerId = await getSummonerId(nickname, server);
    const realm = getRealm(server);
    // const url = `https://${realm}.api.riotgames.com/lol/platform/v4/third-party-code/by-summoner/${playerId}?api_key=${config.RIOT_API_TOKEN}`;
    
    // const verificationCode:any = await axios(url)
    //     .catch(err => {
    //         log.WARN(err);
    //         msg.channel.send(createEmbed(`❌Cannot get verification code`, [{ title: '\_\_\_', content: `Getting 3rd party code failed.` }]));
    //         msg.channel.stopTyping();
    //     })
    // if (uuid !== verificationCode.data) {
    //     msg.channel.send(createEmbed(`❌Incorrect verification code`, [{ title: '\_\_\_', content: `The verification code you've set is incorrect, try again.` }]));
    //     msg.channel.stopTyping();
    //     return;
    // }
    const { tier, rank } = await getTierAndDivision(msg, nickname, server);
    const mastery = await getMastery(msg, nickname, server);
    let userData = {};

    const oldData = cache["users"].find(user => user.discordId === msg.author.id);
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
            msg.channel.send(createEmbed(`❌This account is already registered`, [{ title: '\_\_\_', content: `This account is already registered.` }]));
            msg.channel.stopTyping();
            return;
        }
        userData = oldData;
        userData["accounts"]
            ? userData["accounts"] = [ account ]
            : userData["accounts"].push(account);
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
    upsertOne('vikbot', 'users', { discordId: msg.author.id }, userData, err => {
        err
            ? msg.channel.send(createEmbed(`❌ Cannot verify user`, [{ title: '\_\_\_', content: `Getting user's data failed, probably due to problem with database. Try again later.` }]))
            : msg.channel.send(createEmbed(`✅ Profile verified succesfully`, [{ title: '\_\_\_', content: `To check your profile, you can use \`\`!profile\`\` command now.`}]));
    });
    msg.channel.stopTyping();
}

const getTierAndDivision = async (msg:Discord.Message, nickname:string, server:string) => {
    const playerId = await getSummonerId(nickname, server);
    const realm = getRealm(server);
    const url = `https://${realm}.api.riotgames.com/lol/league/v4/entries/by-summoner/${playerId}?api_key=${config.RIOT_API_TOKEN}`;
    const userLeagues:any = await axios(url)
        .catch(err => {
            log.WARN(err);
            msg.channel.send(createEmbed(`❌Cannot get user's data`, [{ title: '\_\_\_', content: `Getting user's data failed. Try again later.` }]));
            msg.channel.stopTyping();
        })
    const soloQ = userLeagues.data.find(queue => queue.queueType === 'RANKED_SOLO_5x5');
    const soloQRank = soloQ 
        ? { tier: soloQ.tier, rank: soloQ.rank }
        : { tier: 'UNRANKED', rank: 'UNRANKED' }
    return soloQRank;
}

const getMastery = async (msg:Discord.Message, nickname:string, server:string) => {
    const playerId = await getSummonerId(nickname, server);
    const realm = getRealm(server);
    const url = `https://${realm}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${playerId}/by-champion/112?api_key=${config.RIOT_API_TOKEN}`;
    const userMastery:any = await axios(url)
        .catch(err => {
            log.WARN(err);
            msg.channel.send(createEmbed(`❌Cannot get user's mastery`, [{ title: '\_\_\_', content: `Getting user's mastery failed. Try again later.` }]));
            msg.channel.stopTyping();
        })
    const masteryData = userMastery.data 
        ? {
            points: userMastery.data.championPoints,
            chest: userMastery.data.chestGranted,
            level: userMastery.data.championLevel,
            lastPlayed: userMastery.data.lastPlayTime
        }
        : {}
    return masteryData;
}

export const register = async (msg:Discord.Message) => {
    msg.channel.startTyping();

    const { nickname, server } = extractNicknameAndServer(msg); // [TODO] you can register multiple accounts
    const uuid = `VIKBOT-${v4()}`;
    
    if (!nickname || !server)
        return msg.channel.stopTyping();

    // const embed = new Discord.RichEmbed()
    //     .setColor('FDC000')
    //     .setFooter(`Your code expires at ${toDDHHMMSS(new Date(Date.now() + timeout))}`)
    //     .setTitle(`Your unique verification code!`)
    //     .addField('\_\_\_', `\`\`${uuid}\`\`
    //         \nCopy the above code, open League client, go into Settings -> Verification, paste the code in the text box and click "Send".
    //         \nAfter it's done, react with the :white_check_mark:.
    //         \nPicture: https://i.imgur.com/Oa4N6V5.png`);
    // msg.channel.send(embed)
    //     .then(sentEmbed => {
    //         const reactions = [ '✅', '❌' ];
    //         const filter = (reaction, user) => msg.author.id === user.id && (reaction.emoji.name === '❌' || reaction.emoji.name === '✅');
    //         const iterateReactions = (index:number) => {
    //             if (index >= reactions.length)
    //                 return;
    //             // @ts-ignore:next-line
    //             sentEmbed.react(reactions[index]);
    //             setTimeout(() => iterateReactions(index + 1), 500);
    //         }
    //         iterateReactions(0);
            
    //         // @ts-ignore:next-line
    //         sentEmbed.awaitReactions(filter, {
    //             time: timeout,
    //             maxEmojis: 1
    //         })
    //         .then(collected => {
    //             console.log(collected);
                verifyCode(nickname, server, uuid, msg);
    //         })
    //         .catch(e => console.log(e))
    //     })
    //     .catch(err => log.WARN(err));
    // msg.channel.stopTyping();
    // return;
}

export const profile = async (msg:Discord.Message) => {
    msg.channel.startTyping();
    
    let viktorMastery = 0;
    let lastViktorGame = 0;
    const mentions = [ ...msg.mentions.users.values() ];
    const user:Discord.User = mentions.length === 0 ? msg.author : msg.guild.members.find(member => member.id === mentions[0].id).user;
    const userData = cache["users"].find(u => u.discordId === user.id);
    if (!userData || userData["accounts"].length === 0) {
        if (user.id === msg.author.id) {
            msg.channel.send(createEmbed(`:information_source: You didn't register yet`, [{ title: '\_\_\_', content: `Use the \`\`!register <IGN> | <server>\`\` command to create your profile.` }]));
            msg.channel.stopTyping();
            return;
        }
        else {
            msg.channel.send(createEmbed(`:information_source: This user didn't register yet`, [{ title: '\_\_\_', content: `You cannot see profile of this user as they didn't register yet.` }]));
            msg.channel.stopTyping();
            return;
        }
    }

    const embed = new Discord.RichEmbed()
        .setColor('FDC000')
        .setThumbnail(user.avatarURL)
        .setFooter(`Last profile's update`)
        // @ts-ignore:next-line
        .setTimestamp(new Date(userData.updated).toLocaleDateString())
        .setTitle(`:information_source: ${user.username}'s profile`);
    const addAccountField = async (index:number) => {
        if (!userData.accounts[index]) {
            finalize();
            return;
        }
        const account = userData.accounts[index];
        let url;
        let userAccountData;
        let name;
        let opgg;
        if (account.id) {
            url = `https://${getRealm(account.server)}.api.riotgames.com/lol/summoner/v4/summoners/${account.id}?api_key=${config.RIOT_API_TOKEN}`;
            userAccountData = await axios(url).catch(err => log.WARN(err));
        }
        name = account.name
            ? account.name
            : userAccountData && userAccountData.data && userAccountData.data.name 
                ? userAccountData.data.name 
                : 'UNKNOWN NAME';
        opgg = account.opgg 
            ? account.opgg 
            : `https://${account.server}.op.gg/summoner/userName=${name}`;

        const content = `IGN: [**${name}**](${opgg})\nRank: **${account.tier} ${account.rank === 'UNRANKED' ? '' : account.rank }**`;
        viktorMastery += account.mastery.points;
        lastViktorGame = lastViktorGame > account.mastery.lastPlayed ? lastViktorGame : account.mastery.lastPlayed;
        embed.addField(account.server, content, true);
        
        addAccountField(index+1);
    }
    const finalize = () => {
        embed.addField('Description', userData.description 
            ? userData.description 
            : `This user has no description yet.`, false);
        if (userData.accounts.length > 0) {
            embed.addField('Viktor mastery', viktorMastery, true);
            embed.addField('Last Viktor game', lastViktorGame === 0 ? 'never >:C' : new Date(lastViktorGame).toLocaleDateString(), true);
        }
        const memberData = userData.membership;
        if (memberData) {
            const messagesPerDay = (memberData.messageCount/((Date.now()-memberData.joined)/86400000)).toFixed(3);
            embed.addField('Member since', new Date(memberData.joined).toUTCString(), false);
            embed.addField('Messages written', memberData.messageCount, true);
            embed.addField('Messages per day', messagesPerDay, true);
        }
        msg.channel.send(embed);
        msg.channel.stopTyping();
    }

    addAccountField(0);
}

export const description = (msg:Discord.Message) => {
    msg.channel.startTyping();

    let description = removeKeyword(msg).trim();
    let userData = cache["users"].find(user => user.discordId === msg.author.id);

    if (description.length === 0) {
        description = 'This user is a dummy who cannot use simple bot commands, but what do I expect from League players.';
        msg.channel.send(createEmbed(`❌ You forgot description`, [{ title: '\_\_\_', content: `This command requires adding a description. Since you forgot to add it, I've wrote one for you. Have fun.` }]));
    }
    if (description.length > 1024) {
        description = `${description.substring(0, 1017)} (...)`;
        msg.channel.send(createEmbed(`:information_source: Your description is too long`, [{ title: '\_\_\_', content: `Description must not exceed 1024 characters, so I've cut it down a bit.` }]));
    }

    if (!userData) 
        userData = initData(msg.member);
    userData.description = description;

    upsertOne('vikbot', 'users', { discordId: msg.author.id }, userData, err => {
        if (err) {
            log.WARN(err);
            msg.channel.send(createEmbed(`❌Something went wrong`, [{ title: '\_\_\_', content: `Something went wrong. Tell Arcyvilk to check logs.` }]));
        }
    })
    msg.channel.send(createEmbed(`✅ Description updated succesfully`, [{ title: '\_\_\_', content: `To check your profile, you can use \`\`!profile\`\` command.`}]));
    msg.channel.stopTyping();
}