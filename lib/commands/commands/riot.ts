import Discord from "discord.js";
import axios from 'axios';
import config from '../../../config.json';
import { log } from '../../log';
import { cache } from '../../storage/cache';
import { upsertOne } from '../../storage/db';
import { extractNicknameAndServer, createEmbed } from '../../helpers';

export const getRealm = (server:string|undefined) => {
    if (!server) {
        return undefined;
    }
    const platform = cache["servers"].find(s => s.region.toUpperCase() === server.toUpperCase());
    return platform
        ? platform.platform.toLowerCase()
        : undefined
}
export const getSummonerId = async (ign:string|undefined, server:string|undefined) => {
    if (!ign || !server) {
        return undefined;
    }
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

    const pathRecentGames = `https://${realm}.api.riotgames.com/lol/match/v4/matchlists/by-account/${playerId}?api_key=${config.RIOT_API_TOKEN}`;
    const recentGames:any = await axios(pathRecentGames).catch(err => {
        log.WARN(err);
        msg.channel.send(createEmbed(`❌Cannot get player games' data`, [{ title: '\_\_\_', content: `Fetching player ${nickname.toUpperCase()} data failed.` }]));
        return;
    })

    const matchBaseData = recentGames.data.matches[0];
    const matchId = matchBaseData
        ? matchBaseData.gameId
        : undefined;

    const pathLastGameData = `https://${realm}.api.riotgames.com/lol/match/v4/matches/${matchId}?api_key=${config.RIOT_API_TOKEN}`;
    const pathLastGameTimeline = `https://${realm}.api.riotgames.com/lol/match/v4/timelines/by-match/${matchId}?api_key=${config.RIOT_API_TOKEN}`;
    const lastGameData:any = await axios(pathLastGameData).catch(err => {
        log.WARN(err);
        msg.channel.send(createEmbed(`❌Cannot get match data`, [{ title: '\_\_\_', content: `Fetching game ${matchId} data failed.` }]));
        return;
    })    
    let lastGameTimeline:any = await axios(pathLastGameTimeline).catch(err =>{
        log.WARN(err);
        msg.channel.send(createEmbed(`❌Cannot get match data`, [{ title: '\_\_\_', content: `Fetching timeline of game ${matchId} data failed.` }]));
        return;
    })

    let players:any = [ ];
    let winningTeam:any = '';

    lastGameData.data.teams.map((team:any) => {
        if(team.win === 'Win')
            winningTeam = team.teamId;
    })
    lastGameData.data.participantIdentities.map((participant:any) => {
        players.push({
            gameId: participant.participantId,
            id: participant.player.accountId,
            name: participant.player.summonerName,
        })
    })
    lastGameData.data.participants.map((participant:any) => {
        const i = players.findIndex((player:any) => player.gameId === participant.participantId);
        players[i].win = participant.teamId === winningTeam;
        players[i].teamId = participant.teamId;
        players[i].championId = participant.championId;
        players[i].champion = champions.find(champ => champ.id == participant.championId);
        players[i].summ1 = participant.spell1Id;
        players[i].summ2 = participant.spell2Id;
        players[i].fbkill = participant.stats.firstBloodKill;
        players[i].fbassist = participant.stats.firstBloodAssist;
        players[i].role = participant.timeline.role;
        players[i].lane = participant.timeline.lane;
    })
    const ourPlayer = players.find((player:any) => player.id === playerId);
    const enemies = players.filter((player:any) => player.lane === ourPlayer.lane && player.teamId !== ourPlayer.teamId);
    const lane = cache["lanes"].find((lane:any) => lane.lane == ourPlayer.lane)
    const queue = cache["queues"].find((queue:any) => queue.id == lastGameData.data.queueId)

    const embed = new Discord.RichEmbed()
        .setColor('FDC000')
        .setThumbnail(lane ? lane.icon : 'https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/256x256/question.png')
        .setTimestamp(matchBaseData.timestamp)
        .setFooter(`${queue.map}, ${queue.queue}`, ourPlayer.champion ? ourPlayer.champion.img : lane.icon)

    if (enemies.length === 0) {
        const content = 'There was no lane opponent in this game.\nEither it was a bot game, one of the laners roamed a lot or one of the laners was AFK.';
        embed
            .setTitle(`${ourPlayer.champion ? ourPlayer.champion.name.toUpperCase() : '???'}`)
            .setDescription(`**${ourPlayer.name}** (${ourPlayer.champion ? ourPlayer.champion.name : '???' })`)
            .addField('Some info', content)
    }
    else {
        const gameFrames:any = {
            min5: {
                player: {},
                enemies: [],
                allyTeam: 0,
                enemyTeam: 0,
            },
            min10: {
                player: {},
                enemies: [],
                allyTeam: 0,
                enemyTeam: 0,
            },
            min15: {
                player: {},
                enemies: [],
                allyTeam: 0,
                enemyTeam: 0,
            }
        }
        for (let min = 5; min <= 15; min += 5) {
            if (lastGameTimeline.data.frames[min]) {
                const timeline = lastGameTimeline.data.frames[min].participantFrames;
                const player:any = Object.values(timeline).find((player:any) => player.participantId === ourPlayer.gameId);
                gameFrames[`min${min}`].player.cs = player.minionsKilled + player.jungleMinionsKilled;
                gameFrames[`min${min}`].player.gold = player.totalGold;
                gameFrames[`min${min}`].player.level = player.level;

                enemies.map((enemy:any) => {
                    const player:any = Object.values(timeline).find((player:any) => player.participantId === enemy.gameId);
                    gameFrames[`min${min}`].enemies.push({
                        id: enemy.gameId,
                        cs: player.minionsKilled + player.jungleMinionsKilled,
                        gold: player.totalGold,
                        level: player.level,
                    })
                })
            }
        }

        const min5 = gameFrames.min5
            ? `${ourPlayer.champion ? ourPlayer.champion.name : '???'} has ${
                Math.abs(gameFrames.min5.player.gold - gameFrames.min5.enemies[0].gold)} gold ${gameFrames.min5.player.gold - gameFrames.min5.enemies[0].gold > 0 ? 'advantage' : 'disadvantage'}.
                CS scores are ${ourPlayer.champion ? ourPlayer.champion.name : '???'}'s ${gameFrames.min5.player.cs} to ${enemies[0].champion ? enemies[0].champion.name : '???'}'s ${gameFrames.min5.enemies[0].cs}.`
            : 'Game ended by now.'
        const min10 = gameFrames.min5
            ? `${ourPlayer.champion ? ourPlayer.champion.name : '???'} has ${
                Math.abs(gameFrames.min10.player.gold - gameFrames.min10.enemies[0].gold)} gold ${gameFrames.min10.player.gold - gameFrames.min10.enemies[0].gold > 0 ? 'advantage' : 'disadvantage'}.
                CS scores are ${ourPlayer.champion ? ourPlayer.champion.name : '???'}'s ${gameFrames.min10.player.cs} to ${enemies[0].champion ? enemies[0].champion.name : '???'}'s ${gameFrames.min10.enemies[0].cs}.`
            : 'Game ended by now.'
        const min15 = gameFrames.min5
            ? `${ourPlayer.champion ? ourPlayer.champion.name : '???'} has ${
                Math.abs(gameFrames.min15.player.gold - gameFrames.min15.enemies[0].gold)} gold ${gameFrames.min15.player.gold - gameFrames.min15.enemies[0].gold > 0 ? 'advantage' : 'disadvantage'}.
                CS scores are ${ourPlayer.champion ? ourPlayer.champion.name : '???'}'s ${gameFrames.min15.player.cs} to ${enemies[0].champion ? enemies[0].champion.name : '???'}'s ${gameFrames.min15.enemies[0].cs}.`
            : 'Game ended by now.'

        embed
            .setTitle(`${ourPlayer.champion 
                ? ourPlayer.champion.name.toUpperCase() 
                : '???'
            } vs${enemies.map((enemy:any) => enemy.champion ? ` ${enemy.champion.name.toUpperCase()}` : '???')}`)
            .setDescription(`**${ourPlayer.name}'s** ${ourPlayer.champion ? ourPlayer.champion.name : '???' 
            } ${ourPlayer.win ? 'wins' : 'loses'
            } vs ${enemies.map((enemy:any) => ` **${enemy.name}'s** ${enemy.champion ? enemy.champion.name : '???'} `)
            } in ${ Math.round(parseInt(lastGameData.data.gameDuration)/60) } minutes.`)
            .addField('Minute 5', min5)
            .addField('Minute 10', min10)
            .addField('Minute 15', min15)
    }

    msg.channel.send(embed);

    console.log(pathLastGameTimeline);
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