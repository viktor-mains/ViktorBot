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
        const relevantMinutes = [ 5, 10, 15 ];
        const gameFrames:any = { };

        embed
            .setTitle(`${ourPlayer.champion 
                ? ourPlayer.champion.name.toUpperCase() 
                : '???'
            } vs${enemies.map((enemy:any) => enemy.champion ? ` ${enemy.champion.name.toUpperCase()}` : '???')}`)
            .setDescription(`**${ourPlayer.name}'s** ${ourPlayer.champion ? ourPlayer.champion.name : '???' 
            } ${ourPlayer.win ? 'wins' : 'loses'
            } vs ${enemies.map((enemy:any) => ` **${enemy.name}'s** ${enemy.champion ? enemy.champion.name : '???'} `)
            } in ${ Math.round(parseInt(lastGameData.data.gameDuration)/60) } minutes.`);

        relevantMinutes.map((minute:number) => {
            if (lastGameTimeline.data.frames[minute]) {
                const timeline = lastGameTimeline.data.frames[minute].participantFrames;
                const player:any = Object.values(timeline).find((player:any) => player.participantId === ourPlayer.gameId);

                gameFrames[`min${minute}`] = {
                    player: {
                        cs: player.minionsKilled + player.jungleMinionsKilled,
                        gold: player.totalGold,
                        level: player.level
                    },
                    enemies: [],
                    allyTeam: 0,
                    enemyTeam: 0,
                };

                enemies.map((enemy:any) => {
                    const player:any = Object.values(timeline).find((player:any) => player.participantId === enemy.gameId);
                    gameFrames[`min${minute}`].enemies.push({
                        id: enemy.gameId,
                        cs: player.minionsKilled + player.jungleMinionsKilled,
                        gold: player.totalGold,
                        level: player.level,
                    })
                });

                Object.values(timeline).map((player:any) => {
                    const currentPlayer = players.find((p:any) => p.gameId === player.participantId);
                    if (currentPlayer && currentPlayer.teamId !== ourPlayer.teamId && currentPlayer.lane !== ourPlayer.lane)
                        gameFrames[`min${minute}`].enemyTeam += player.totalGold;
                    if (currentPlayer && currentPlayer.teamId === ourPlayer.teamId && currentPlayer.lane !== ourPlayer.lane)
                        gameFrames[`min${minute}`].allyTeam += player.totalGold;
                });

                const playerChampionName = ourPlayer.champion ? ourPlayer.champion.name : '[unknown ally champion]';
                const enemyChampionName = enemies[0].champion ? enemies[0].champion.name : '[unknown enemy champion]';
                const playerGold = gameFrames[`min${minute}`].player.gold;
                const playerCs = gameFrames[`min${minute}`].player.cs;
                const enemyCs = gameFrames[`min${minute}`].enemies[0].cs;
                const enemyGold = gameFrames[`min${minute}`].enemies[0].gold;
                const allyTeamGoldAdvantage = gameFrames[`min${minute}`].allyTeam - gameFrames[`min${minute}`].enemyTeam;
                const minuteSummary = gameFrames[`min${minute}`]
                    ? `${playerChampionName} has **${Math.abs(playerGold - enemyGold)}** gold ${playerGold - enemyGold > 0 ? 'advantage' : 'disadvantage'}.
                        CS scores are ${playerChampionName}'s **${playerCs}** to ${enemyChampionName}'s **${enemyCs}**.
                        All other lanes ${allyTeamGoldAdvantage >= 0 ? 'win' : 'lose'} with **${Math.abs(allyTeamGoldAdvantage)}** gold ${allyTeamGoldAdvantage >= 0? 'advantage' : 'disadvantage'}.`
                    : 'Game ended by now.';
                embed.addField(`Minute ${minute}`, minuteSummary)
            }
        })
    }

    msg.channel.send(embed);
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
