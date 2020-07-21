import Discord from "discord.js";
import axios from 'axios';
import { orderBy } from 'lodash';
import config from '../../../config.json';
import { log } from '../../log';
import { cache } from '../../storage/cache';
import { upsertOne, findUserByDiscordId, findOption } from '../../storage/db';
import { extractNicknameAndServer, createEmbed, extractArguments } from '../../helpers';

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
        const path = `https://${realm}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${ign.replace(' ', '')}?api_key=${config.RIOT_API_TOKEN}`;
        summoner = await axios(path)
    }
    catch(err) {
        return undefined;
    }
    return summoner.data.id;
}
export const getAccountId = async (ign:string|undefined, server:string|undefined) => {
    if (!ign || !server) {
        return undefined;
    }
    const realm = getRealm(server)
    let summoner;
    if (!realm) {
        return undefined;
    }
    try {
        const path = `https://${realm}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${ign.replace(' ', '')}?api_key=${config.RIOT_API_TOKEN}`;
        summoner = await axios(path);
    }
    catch(err) {
        return undefined;
    }
    return summoner.data.accountId;
}

export const updatechampions = async (msg: Discord.Message) => {
  const version = await axios(
    `https://ddragon.leagueoflegends.com/api/versions.json`
  );
  const path = `https://ddragon.leagueoflegends.com/cdn/${version[0]}/data/en_US/championFull.json`;
  let championsRaw = await axios(path);
  const tasks = Object.values(championsRaw.data.data).map(
    async (champion: any) => {
      try {
        await upsertOne(
          "champions",
          { id: champion.key },
          {
            id: champion.key,
            name: champion.name,
            title: champion.title,
            img: `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`,
          }
        );
      } catch {
        await msg.channel.send(
          createEmbed(`❌ Error updating champions`, [
            {
              title: "___",
              content: `${champion.name} couldn't get updated. :C`,
            },
          ])
        );
      }
    }
  );

  await Promise.all(tasks);
  msg.channel.send(
    createEmbed("✅ Champions updated", [
      { title: "___", content: `Version; ${version[0]}` },
    ])
  );
};

export const lastlane = async (msg:Discord.Message) => {
    msg.channel.startTyping();

    const champions = cache["champions"];
    const { nickname, server } = extractNicknameAndServer(msg);
    const playerId = await getAccountId(nickname, server);
    const realm = getRealm(server);

    if (!nickname || !server)
        return msg.channel.stopTyping();
    if (!playerId || !realm) {
        msg.channel.send(createEmbed('❌ Incorrect nickname or server', [{ title: '\_\_\_', content: 'Check if the data you\'ve provided is correct.' }]));
        msg.channel.stopTyping();
        return;
    }
    const pathRecentGames = `https://${realm}.api.riotgames.com/lol/match/v4/matchlists/by-account/${playerId}?api_key=${config.RIOT_API_TOKEN}`;
    const recentGames:any = await axios(pathRecentGames).catch(err => {
        log.WARN(err);
        msg.channel.send(createEmbed(`❌Cannot get player games' data`, [{ title: '\_\_\_', content: `Fetching player ${nickname.toUpperCase()} data failed.` }]));
        msg.channel.stopTyping();
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
        msg.channel.stopTyping();
        return;
    })
    let lastGameTimeline:any = await axios(pathLastGameTimeline).catch(err =>{
        log.WARN(err);
        msg.channel.send(createEmbed(`❌Cannot get match data`, [{ title: '\_\_\_', content: `Fetching timeline of game ${matchId} data failed.` }]));
        msg.channel.stopTyping();
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
                        Creep scores are ${playerChampionName}'s **${playerCs}** to ${enemyChampionName}'s **${enemyCs}**.
                        All other lanes ${allyTeamGoldAdvantage >= 0 ? 'win' : 'lose'} with **${Math.abs(allyTeamGoldAdvantage)}** gold ${allyTeamGoldAdvantage >= 0? 'advantage' : 'disadvantage'}.`
                    : 'Game ended by now.';
                embed.addField(`Minute ${minute}`, minuteSummary)
            }
        })
    }

    msg.channel.stopTyping();
    msg.channel.send(embed);
}
export const lastgame = async (msg:Discord.Message) => {
    // https://eun1.api.riotgames.com/lol/match/v4/matches/2281378026?api_key=RGAPI-570a0582-2aef-470b-8b66-938c35b3cf31
}
export const mastery = async (msg:Discord.Message) => {
    msg.channel.startTyping();
    const selfRequest = !!!(extractArguments(msg).length);

    if (selfRequest) {
        const user = await findUserByDiscordId(msg.author.id);
        const accounts = user?.accounts ?? [];
        if (accounts.length !== 0)
            accounts.map(account => aggregateMasteryData(msg, undefined, account.server, account.id));
        else
            msg.channel.send(createEmbed(`:information_source: You don't have any accounts registered`, [{ title: '\_\_\_', content:
                `To use this commands without arguments you have to register your League account first: \`\`!register <IGN> | <server>\`\`.
                Otherwise, this command can be used as follows: \`\`!mastery IGN|server\`\`.` }]));
    }
    else {
        const { nickname, server } = extractNicknameAndServer(msg);
        aggregateMasteryData(msg, nickname, server)
    }
}
const aggregateMasteryData = async (msg:Discord.Message, nickname:string|undefined, server:string|undefined, playerId?:string) => {
    const realm = getRealm(server);
    if (!playerId)
        playerId = await getSummonerId(nickname, server);
    if (!nickname) {
        const nicknameUrl = `https://${realm}.api.riotgames.com/lol/summoner/v4/summoners/${playerId}?api_key=${config.RIOT_API_TOKEN}`;
        const nicknameData = await axios(nicknameUrl);
        nickname = nicknameData.data.name;
    }
    if (!nickname || !server ) {
        msg.channel.stopTyping();
        return;
    }
    if (!playerId || !realm) {
        msg.channel.send(createEmbed('❌ Incorrect nickname or server', [{ title: '\_\_\_', content: 'Check if the data you\'ve provided is correct.' }]));
        msg.channel.stopTyping();
        return;
    }
    const champions = cache["champions"];
    const topX = await findOption("topMasteries") ?? 3;
    const masteryIcons = await findOption("masteryIcons") ?? [];
    const url = `https://${realm}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${playerId}?api_key=${config.RIOT_API_TOKEN}`;
    const masteryData = await axios(url);
    const masteryList = orderBy(masteryData.data, ['championPoints'], ['desc'])
        .slice(0,topX);
    const mostMasteryIcon = masteryList[0] ? champions.find(ch => ch.id == masteryList[0].championId).img : null;
    const collectiveMasteryLevels = { level5: 0, level6: 0, level7: 0 }
    let collectiveMastery = 0;
    masteryData.data.map(d => {
        collectiveMastery = collectiveMastery + d.championPoints;
        [5,6,7].includes(d.championLevel)
            ? collectiveMasteryLevels[`level${d.championLevel}`]++
            : null
    });
    let collectiveMasteryLevelsString = '';
    for (const level of Object.keys(collectiveMasteryLevels)) {
        const icon = masteryIcons.find(mI => level.indexOf(mI.mastery.toString()) !== -1)
        collectiveMasteryLevelsString += `${icon?.emote} x${collectiveMasteryLevels[level]} `;
    }

    const embed = new Discord.RichEmbed()
        .setTitle(`Top ${topX} masteries - ${nickname.toUpperCase()} [${server.toUpperCase()}]`)
        .setDescription(`${collectiveMasteryLevelsString}\n**Collective mastery**: ${collectiveMastery}`)
        .setTimestamp(new Date())
        .setThumbnail(mostMasteryIcon)
        .setFooter(`${msg.author.username}`)
        .setColor('0xFDC000')

    masteryList.map(mastery => {
        const champion = champions.find(ch => ch.id == mastery.championId);
        const masteryIcon = masteryIcons.find(mI => mI.mastery === mastery.championLevel);
        let title = `${champion.name}, ${champion.title}`;
        if (masteryIcon)
            title = `${masteryIcon.emote} ${title} ${mastery.chestGranted ? '<:chest_unlocked:672434420195655701>' : ''}`
        embed.addField(title,
            `**Points**: ${mastery.championPoints}\n`+
            `**Last game**: ${new Date(mastery.lastPlayTime).toLocaleDateString()}`, false)
    })
    msg.channel.send(embed);
    msg.channel.stopTyping();
}

export const ingame = async (msg:Discord.Message) => {
    msg.channel.startTyping();
    const selfRequest = !!!(extractArguments(msg).length);

    if (selfRequest) {
        const user = await findUserByDiscordId(msg.author.id);
        const accounts = user?.accounts ?? []
        if (accounts.length > 0)
            accounts.map(account => aggregateMasteryData(msg, undefined, account.server, account.id));
        else
            msg.channel.send(createEmbed(`:information_source: You don't have any accounts registered`, [{ title: '\_\_\_', content:
                `To use this commands without arguments you have to register your League account first: \`\`!register <IGN> | <server>\`\`.
                Otherwise, this command can be used as follows: \`\`!ingame IGN|server\`\`.` }]));
    }
    else {
        const { nickname, server } = extractNicknameAndServer(msg);
        aggregateInGameData(msg, nickname, server)
    }
}
const aggregateInGameData = async (msg:Discord.Message, nickname:string|undefined, server:string|undefined, playerId?:string) => {
    const realm = getRealm(server);
    if (!playerId)
        playerId = await getSummonerId(nickname, server);
    if (!nickname) {
        const nicknameUrl = `https://${realm}.api.riotgames.com/lol/summoner/v4/summoners/${playerId}?api_key=${config.RIOT_API_TOKEN}`;
        const nicknameData = await axios(nicknameUrl);
        nickname = nicknameData.data.name;
    }
    if (!nickname || !server ) {
        msg.channel.stopTyping();
        return;
    }
    if (!playerId || !realm) {
        msg.channel.send(createEmbed('❌ Incorrect nickname or server', [{ title: '\_\_\_', content: 'Check if the data you\'ve provided is correct.' }]));
        msg.channel.stopTyping();
        return;
    }
    const champions = cache["champions"];
}