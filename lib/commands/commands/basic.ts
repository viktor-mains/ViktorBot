import Discord from 'discord.js';
import axios from 'axios';
import v4 from 'uuid/v4';
import { log } from '../../log';
import { cache } from '../../storage/cache';
import { upsertOne } from '../../storage/db';
import { extractNicknameAndServer, createEmbed, getCommandSymbol, splitArrayByObjectKey } from '../../helpers';
import { getSummonerId, getRealm } from './riot';
import config from '../../../config.json';
import { getMaxListeners } from 'cluster';

type TField = {
    title: string,
    content: string
}

export const opgg = (msg:Discord.Message) => {
    const { nickname, server } = extractNicknameAndServer(msg);
    if (nickname && server)
        msg.channel.send(`https://${ server }.op.gg/summoner/userName=${ nickname }`)
}

export const help = (msg:Discord.Message) => {
    msg.channel.startTyping();
    let fields = new Array<TField>();
    let commands = cache["commands"]
        .filter(command => command.isModOnly === false && command.description);
    commands = splitArrayByObjectKey(commands, 'category');

    for (let category in commands) {
        const title = `Category ${category.toUpperCase()}`;
        let content = '';
        commands[category].map(command => content += `\`\`-\`\`**${getCommandSymbol()}${command.keyword}** - ${command.description}\n`);
        fields.push({ title, content })
    }
        
    const embed = createEmbed('📜 List of commands', fields);
    msg.channel.stopTyping();
    msg.channel.send(embed);
}

export const hmod = (msg:Discord.Message) => {
    msg.channel.startTyping();
    let fields = new Array<TField>();
    let commands = cache["commands"]
        .filter(command => command.isModOnly === true && command.description);
    commands = splitArrayByObjectKey(commands, 'category');

    for (let category in commands) {
        const title = `Category ${category.toUpperCase()}`;
        let content = '';
        commands[category].map(command => content += `\`\`-\`\`**${getCommandSymbol()}${command.keyword}** - ${command.description}\n`);
        fields.push({ title, content })
    }
        
    const embed = createEmbed('📜 List of moderator commands', fields);
    msg.channel.stopTyping();
    msg.channel.send(embed);
}

// profiles stuff
export const register = async (msg:Discord.Message) => {
    msg.channel.startTyping();

    const { nickname, server } = extractNicknameAndServer(msg); // [TODO] you can register multiple accounts
    const uuid = `VIKBOT-${v4()}`;
    
    if (!nickname || !server)
        return msg.channel.stopTyping();

    // const embed = createEmbed('Your unique verification code!', [{ title: '\_\_\_', content: 
    //     `\`\`${uuid}\`\`
    //     \nCopy the above code, open League client, go into Settings -> Verification, paste the code in the text box and click "Send".
    //     \nAfter it's done, react with the :white_check_mark:.
    //     \nPicture: https://i.imgur.com/Oa4N6V5.png`}]);
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
    //             time: 300000,
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
    const userData = {
        discordId: msg.author.id,
        updated: Date.now(),
        accounts: [{
            server: server.toUpperCase(),
            id: playerId,
            tier,
            rank,
            mastery
        }]
    };
    upsertOne('vikbot', 'users', { discordId: msg.author.id }, userData, err => {
        err
            ? msg.channel.send(createEmbed(`❌ Cannot verify user`, [{ title: '\_\_\_', content: `Getting user's data failed, probably due to problem with database. Try again later.` }]))
            : msg.channel.send(createEmbed(`✅ Profile verified succesfully`, [{ title: '\_\_\_', content: `To check your profile, you can use \`\`!profile\`\` command now.`}]));
    })
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