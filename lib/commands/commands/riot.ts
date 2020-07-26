import Discord from "discord.js";
import { orderBy } from "lodash";
import config from "../../../config.json";
import { cache } from "../../storage/cache";
import { upsertOne } from "../../storage/db";
import {
  extractNicknameAndServer,
  createEmbed,
  extractArguments,
} from "../../helpers";
import {
  RiotClient,
  fetchChampions,
  fetchVersions,
  fetchRecentGames,
  fetchMatchInfo,
  fetchMatchTimeline,
  getSummonerByName,
  Summoner,
  fetchSummonerMasteries,
  getSummonerByAccountId,
} from "../../riot";

const client = new RiotClient(config.RIOT_API_TOKEN);

export const getPlatform = (server: string | undefined) => {
  if (!server) {
    return undefined;
  }
  const platform = cache["servers"].find(
    (s) => s.region.toUpperCase() === server.toUpperCase()
  );
  return platform ? platform.platform.toLowerCase() : undefined;
};

export const getSummonerId = async (
  ign: string | undefined,
  server: string | undefined
) => {
  if (!ign || !server) {
    return undefined;
  }

  try {
    const platform = getPlatform(server);
    const summoner = await getSummonerByName(client, platform, ign);
    return summoner.data.id;
  } catch (err) {
    return undefined;
  }
};

const getAccountId = async (
  ign: string | undefined,
  server: string | undefined
) => {
  if (!ign || !server) {
    return undefined;
  }

  try {
    const platform = getPlatform(server);
    const summoner = await getSummonerByName(client, platform, ign);
    return summoner.data.accountId;
  } catch (err) {
    return undefined;
  }
};

export const updatechampions = async (msg: Discord.Message) => {
  const { data: versions } = await fetchVersions(client);
  const version = versions[0];
  const { data: champions } = await fetchChampions(client, version);

  for (const champion of Object.values(champions.data)) {
    const champ = {
      id: champion.key,
      name: champion.name,
      title: champion.title,
      img: `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`,
    };

    try {
      await upsertOne("vikbot", "champions", { id: champion.key }, champ);
    } catch {
      msg.channel.send(
        createEmbed(`❌ Error updating champions`, [
          {
            title: "___",
            content: `${champion.name} couldn't get updated. :C`,
          },
        ])
      );
    }
  }

  msg.channel.send(
    createEmbed("✅ Champions updated", [
      { title: "___", content: `Version; ${version[0]}` },
    ])
  );
};

export const lastlane = async (msg: Discord.Message) => {
  msg.channel.startTyping();

  const champions = cache["champions"];
  const { nickname, server } = extractNicknameAndServer(msg);
  const playerId = await getAccountId(nickname, server);
  const platform = getPlatform(server);

  if (!nickname || !server) return msg.channel.stopTyping();
  if (!playerId || !platform) {
    msg.channel.send(
      createEmbed("❌ Incorrect nickname or server", [
        {
          title: "___",
          content: "Check if the data you've provided is correct.",
        },
      ])
    );
    msg.channel.stopTyping();
    return;
  }

  const recentGames = await fetchRecentGames(client, platform, playerId);
  if (recentGames.data.matches.length === 0) {
    // No known recent games?
    msg.channel.send(
      createEmbed("❌ Incorrect nickname or server", [
        {
          title: "___",
          content: "Check if the data you've provided is correct.",
        },
      ])
    );
    msg.channel.stopTyping();
    return;
  }

  const matchBaseData = recentGames.data.matches[0];
  const matchId = matchBaseData.gameId;
  const [lastGameData, lastGameTimeline] = await Promise.all([
    fetchMatchInfo(client, platform, matchId),
    fetchMatchTimeline(client, platform, matchId),
  ]);

  let players: any = [];
  let winningTeam: any = "";

  lastGameData.data.teams.map((team: any) => {
    if (team.win === "Win") winningTeam = team.teamId;
  });
  lastGameData.data.participantIdentities.map((participant: any) => {
    players.push({
      gameId: participant.participantId,
      id: participant.player.accountId,
      name: participant.player.summonerName,
    });
  });
  lastGameData.data.participants.map((participant: any) => {
    const i = players.findIndex(
      (player: any) => player.gameId === participant.participantId
    );
    players[i].win = participant.teamId === winningTeam;
    players[i].teamId = participant.teamId;
    players[i].championId = participant.championId;
    players[i].champion = champions.find(
      (champ) => champ.id == participant.championId
    );
    players[i].summ1 = participant.spell1Id;
    players[i].summ2 = participant.spell2Id;
    players[i].fbkill = participant.stats.firstBloodKill;
    players[i].fbassist = participant.stats.firstBloodAssist;
    players[i].role = participant.timeline.role;
    players[i].lane = participant.timeline.lane;
  });
  const ourPlayer = players.find((player: any) => player.id === playerId);
  const enemies = players.filter(
    (player: any) =>
      player.lane === ourPlayer.lane && player.teamId !== ourPlayer.teamId
  );
  const lane = cache["lanes"].find((lane: any) => lane.lane == ourPlayer.lane);
  const queue = cache["queues"].find(
    (queue: any) => queue.id == lastGameData.data.queueId
  );

  const embed = new Discord.RichEmbed()
    .setColor("FDC000")
    .setThumbnail(
      lane
        ? lane.icon
        : "https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/256x256/question.png"
    )
    .setTimestamp(new Date(matchBaseData.timestamp))
    .setFooter(
      `${queue.map}, ${queue.queue}`,
      ourPlayer.champion ? ourPlayer.champion.img : lane.icon
    );

  if (enemies.length === 0) {
    const content =
      "There was no lane opponent in this game.\nEither it was a bot game, one of the laners roamed a lot or one of the laners was AFK.";
    embed
      .setTitle(
        `${ourPlayer.champion ? ourPlayer.champion.name.toUpperCase() : "???"}`
      )
      .setDescription(
        `**${ourPlayer.name}** (${
          ourPlayer.champion ? ourPlayer.champion.name : "???"
        })`
      )
      .addField("Some info", content);
  } else {
    const relevantMinutes = [5, 10, 15];
    const gameFrames: any = {};

    embed
      .setTitle(
        `${
          ourPlayer.champion ? ourPlayer.champion.name.toUpperCase() : "???"
        } vs${enemies.map((enemy: any) =>
          enemy.champion ? ` ${enemy.champion.name.toUpperCase()}` : "???"
        )}`
      )
      .setDescription(
        `**${ourPlayer.name}'s** ${
          ourPlayer.champion ? ourPlayer.champion.name : "???"
        } ${ourPlayer.win ? "wins" : "loses"} vs ${enemies.map(
          (enemy: any) =>
            ` **${enemy.name}'s** ${
              enemy.champion ? enemy.champion.name : "???"
            } `
        )} in ${Math.round(
          parseInt(lastGameData.data.gameDuration) / 60
        )} minutes.`
      );

    relevantMinutes.map((minute: number) => {
      if (lastGameTimeline.data.frames[minute]) {
        const timeline = lastGameTimeline.data.frames[minute].participantFrames;
        const player: any = Object.values(timeline).find(
          (player: any) => player.participantId === ourPlayer.gameId
        );

        gameFrames[`min${minute}`] = {
          player: {
            cs: player.minionsKilled + player.jungleMinionsKilled,
            gold: player.totalGold,
            level: player.level,
          },
          enemies: [],
          allyTeam: 0,
          enemyTeam: 0,
        };

        enemies.map((enemy: any) => {
          const player: any = Object.values(timeline).find(
            (player: any) => player.participantId === enemy.gameId
          );
          gameFrames[`min${minute}`].enemies.push({
            id: enemy.gameId,
            cs: player.minionsKilled + player.jungleMinionsKilled,
            gold: player.totalGold,
            level: player.level,
          });
        });

        Object.values(timeline).map((player: any) => {
          const currentPlayer = players.find(
            (p: any) => p.gameId === player.participantId
          );
          if (
            currentPlayer &&
            currentPlayer.teamId !== ourPlayer.teamId &&
            currentPlayer.lane !== ourPlayer.lane
          )
            gameFrames[`min${minute}`].enemyTeam += player.totalGold;
          if (
            currentPlayer &&
            currentPlayer.teamId === ourPlayer.teamId &&
            currentPlayer.lane !== ourPlayer.lane
          )
            gameFrames[`min${minute}`].allyTeam += player.totalGold;
        });

        const playerChampionName = ourPlayer.champion
          ? ourPlayer.champion.name
          : "[unknown ally champion]";
        const enemyChampionName = enemies[0].champion
          ? enemies[0].champion.name
          : "[unknown enemy champion]";
        const playerGold = gameFrames[`min${minute}`].player.gold;
        const playerCs = gameFrames[`min${minute}`].player.cs;
        const enemyCs = gameFrames[`min${minute}`].enemies[0].cs;
        const enemyGold = gameFrames[`min${minute}`].enemies[0].gold;
        const allyTeamGoldAdvantage =
          gameFrames[`min${minute}`].allyTeam -
          gameFrames[`min${minute}`].enemyTeam;
        const minuteSummary = gameFrames[`min${minute}`]
          ? `${playerChampionName} has **${Math.abs(
              playerGold - enemyGold
            )}** gold ${
              playerGold - enemyGold > 0 ? "advantage" : "disadvantage"
            }.
                        Creep scores are ${playerChampionName}'s **${playerCs}** to ${enemyChampionName}'s **${enemyCs}**.
                        All other lanes ${
                          allyTeamGoldAdvantage >= 0 ? "win" : "lose"
                        } with **${Math.abs(allyTeamGoldAdvantage)}** gold ${
              allyTeamGoldAdvantage >= 0 ? "advantage" : "disadvantage"
            }.`
          : "Game ended by now.";
        embed.addField(`Minute ${minute}`, minuteSummary);
      }
    });
  }

  msg.channel.stopTyping();
  msg.channel.send(embed);
};

export const mastery = async (msg: Discord.Message) => {
  msg.channel.startTyping();
  const selfRequest = !!!extractArguments(msg).length;

  if (selfRequest) {
    const user = cache["users"].find(
      (user) => user.discordId === msg.author.id
    );
    if (user && user.accounts && user.accounts.length !== 0) {
      for (const account of user.accounts) {
        const platform = getPlatform(account.server);
        const { data: summoner } = await getSummonerByAccountId(
          client,
          platform,
          account.id
        );

        aggregateMasteryData(
          msg,
          summoner.name,
          account.server,
          platform,
          summoner
        );
      }
    } else
      msg.channel.send(
        createEmbed(
          `:information_source: You don't have any accounts registered`,
          [
            {
              title: "___",
              content: `To use this commands without arguments you have to register your League account first: \`\`!register <IGN> | <server>\`\`.
                Otherwise, this command can be used as follows: \`\`!mastery IGN|server\`\`.`,
            },
          ]
        )
      );
  } else {
    const { nickname, server } = extractNicknameAndServer(msg);
    if (nickname === undefined || server === undefined) {
      return;
    }

    const platform = getPlatform(server);
    const { data: summoner } = await getSummonerByName(
      client,
      platform,
      nickname
    );

    aggregateMasteryData(msg, nickname, server, platform, summoner);
  }
};
const aggregateMasteryData = async (
  msg: Discord.Message,
  nickname: string,
  server: string,
  platform: string,
  summoner: Summoner
) => {
  const champions = cache["champions"];
  const topX = cache["options"].find(
    (option) => option.option === "topMasteries"
  )
    ? cache["options"].find((option) => option.option === "topMasteries").value
    : 3;
  const masteryIcons = cache["options"].find(
    (option) => option.option === "masteryIcons"
  )
    ? cache["options"].find((option) => option.option === "masteryIcons").value
    : null;
  const masteryData = await fetchSummonerMasteries(client, platform, summoner);
  const masteryList = orderBy(
    masteryData.data,
    ["championPoints"],
    ["desc"]
  ).slice(0, topX);
  const mostMasteryIcon = masteryList[0]
    ? champions.find((ch) => ch.id == masteryList[0].championId).img
    : null;
  const collectiveMasteryLevels = { level5: 0, level6: 0, level7: 0 };
  let collectiveMastery = 0;
  masteryData.data.map((d) => {
    collectiveMastery = collectiveMastery + d.championPoints;
    [5, 6, 7].includes(d.championLevel)
      ? collectiveMasteryLevels[`level${d.championLevel}`]++
      : null;
  });
  let collectiveMasteryLevelsString = "";
  for (let level in collectiveMasteryLevels)
    collectiveMasteryLevelsString += `${
      masteryIcons.find((mI) => level.indexOf(mI.mastery) !== -1).emote
    } x${collectiveMasteryLevels[level]} `;
  const embed = new Discord.RichEmbed()
    .setTitle(
      `Top ${topX} masteries - ${nickname.toUpperCase()} [${server.toUpperCase()}]`
    )
    .setDescription(
      `${collectiveMasteryLevelsString}\n**Collective mastery**: ${collectiveMastery}`
    )
    .setTimestamp(new Date())
    .setThumbnail(mostMasteryIcon)
    .setFooter(`${msg.author.username}`)
    .setColor("0xFDC000");
  masteryList.map((mastery) => {
    const champion = champions.find((ch) => ch.id == mastery.championId);
    const masteryIcon = masteryIcons.find(
      (mI) => mI.mastery === mastery.championLevel
    );
    let title = `${champion.name}, ${champion.title}`;
    if (masteryIcon)
      title = `${masteryIcon.emote} ${title} ${
        mastery.chestGranted ? "<:chest_unlocked:672434420195655701>" : ""
      }`;
    embed.addField(
      title,
      `**Points**: ${mastery.championPoints}\n` +
        `**Last game**: ${new Date(mastery.lastPlayTime).toLocaleDateString()}`,
      false
    );
  });
  msg.channel.send(embed);
  msg.channel.stopTyping();
};
