import Discord from "discord.js";
import axios from 'axios';
import config from '../../../config.json';
import { log } from '../../log';
import { cache } from '../../storage/cache';
import { upsertOne } from '../../storage/db';
import { extractNicknameAndServer, 
    removeKeyword,
    createEmbed, 
    getCommandSymbol, 
    splitArrayByObjectKey } from '../../helpers';

export const getRealm = (server:string) => {
    const platform = cache["servers"].find(s => s.region.toUpperCase() === server.toUpperCase());
    return platform
        ? platform.platform.toLowerCase()
        : undefined
}
export const getSummonerId = async (ign:string, server:string) => {
    const realm = getRealm(server)
    let summoner;
    if (!realm) {
        return undefined;
    }
    try {
        const path = `https://${realm}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${ign}?api_key=${config.RIOT_API_TOKEN}`;
        summoner = await axios(path);
    }
    catch(err) {
        log.WARN(err);
        return undefined;
    }
    return summoner.data.accountId;
}
export const lastlane = async (msg:Discord.Message) => {
    const champions = cache["champions"];
    const { nickname, server } = extractNicknameAndServer(msg);
    const playerId = await getSummonerId(nickname, server);
    const realm = getRealm(server);
    let recentGames;
    let lastGame;
    try {
        const path = `https://${realm}.api.riotgames.com/lol/match/v4/matchlists/by-account/${playerId}?api_key=${config.RIOT_API_TOKEN}`;
        log.INFO(path);
        recentGames = await axios(path);
    }
    catch(err) {
        log.WARN(err);
        msg.channel.send(createEmbed(`❌Cannot get player games' data`, [{ title: '\_\_\_', content: `Fetching player ${nickname.toUpperCase()} data failed.` }]));
        return;
    }
    const matchBaseData = recentGames.data.matches[0];
    const matchId = matchBaseData
        ? matchBaseData.gameId
        : undefined
    
    try {
        const path = `https://${realm}.api.riotgames.com/lol/match/v4/timelines/by-match/${matchId}?api_key=${config.RIOT_API_TOKEN}`;
        log.INFO(path);
        lastGame = await axios(path);
    }
    catch(err) {
        log.WARN(err);
        msg.channel.send(createEmbed(`❌Cannot get match data`, [{ title: '\_\_\_', content: `Fetching match ${matchId} data failed.` }]));
        return;
    }
    console.log(lastGame.data);    
}

export const updatechampions = async (msg:Discord.Message) => {
    const version = await axios(`https://ddragon.leagueoflegends.com/api/versions.json`);
    const path = `https://ddragon.leagueoflegends.com/cdn/${version[0]}/data/en_US/championFull.json`
    let championsRaw = await axios(path);
    Object.values(championsRaw.data.data)
        .map((champion:any) => {
            const champ = {
                id: champion.key,
                name: champion.name,
                title: champion.title,
                img: `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`
            };
            upsertOne('vikbot', 'champions', { id: champion.key }, champ, (err, result) => {
                if (err) {
                    msg.channel.send(createEmbed(`❌ Error updating champions`, [{ title: '\_\_\_', content: `${champion.name} couldn't get updated. :C` }]));
                    return;
                }
            })
        })
    msg.channel.send(createEmbed('✅ Champions updated', [{ title: '\_\_\_', content: `Version; ${version[0]}` }]));
}
export const race = (msg:Discord.Message) => {
    
}
export const lastgame = (msg:Discord.Message) => {
    // https://eun1.api.riotgames.com/lol/match/v4/matches/2281378026?api_key=RGAPI-570a0582-2aef-470b-8b66-938c35b3cf31
}
export const ingame = (msg:Discord.Message) => {
    
}
export const mastery = (msg:Discord.Message) => {

}