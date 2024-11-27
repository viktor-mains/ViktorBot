import Discord from 'discord.js';
import { orderBy } from 'lodash';
import {
	upsertOne,
	findUserByDiscordId,
	findOption,
	findServerByName,
	findLane,
  findQueue,
  findChampion,
  getAllChampions,
} from '../../storage/db';
import {
	extractNicknameAndServer,
	createEmbed,
	extractArguments,
} from '../../utils/helpers';
import {
	client,
	fetchChampions,
	fetchVersions,
	fetchRecentGames,
	fetchMatchInfo,
	fetchMatchTimeline,
	getSummonerByName,
	Summoner,
	fetchSummonerMasteries,
	getSummonerBySummonerId,
} from '../../utils/riot';
import { format as sprintf } from 'util';
import { COLORS } from '../../utils/colors';

export const getPlatform = async (server?: string): Promise<string> => {
	const { platform } = await findServerByName(server);
	return platform;
};

export const getHost = async (server?: string): Promise<string> => {
	const { host } = await findServerByName(server);
	return `https://${host}`;
};

export const getSummonerId = async (
	ign: string | undefined,
	server: string | undefined,
): Promise<string | undefined> => {
	if (!ign || !server) {
		return undefined;
	}

	try {
		const host = await getHost(server);
		if (host === undefined) {
			return undefined;
		}

		const summoner = await getSummonerByName(client, host, ign);
		return summoner.data.id;
	} catch (err) {
		return undefined;
	}
};

const getAccountId = async (
	ign: string | undefined,
	server: string | undefined,
) => {
	if (!ign || !server) {
		return undefined;
	}

	try {
		const host = await getHost(server);
		if (host === undefined) {
			return undefined;
		}

		const summoner = await getSummonerByName(client, host, ign);
		return summoner.data.accountId;
	} catch (err) {
		return undefined;
	}
};

export const updatechampions = async (msg: Discord.Message): Promise<void> => {
	const { data: versions } = await fetchVersions(client);
	const [version] = versions;
	const { data: champions } = await fetchChampions(client, version);

	const tasks = Object.values(champions.data).map(async (champion: any) => {
		try {
			await upsertOne(
				'champions',
				{ id: parseInt(champion.key) },
				{
					id: parseInt(champion.key),
					name: champion.name,
					title: champion.title,
					img: `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`,
				},
			);
		} catch {
			await msg.channel.send(
				createEmbed(`❌ Error updating champions`, [
					{
						title: '___',
						content: `${champion.name} couldn't get updated. :C`,
					},
				]),
			);
		}
	});

	await Promise.all(tasks);

	await msg.channel.send(
		createEmbed('✅ Champions updated', [
			{ title: '___', content: `Version: ${version}` },
		]),
	);
};

export const lastlane = async (msg: Discord.Message): Promise<void> => {
	msg.channel.startTyping();
	const { nickname, server } = extractNicknameAndServer(msg);
  const playerId = await getAccountId(nickname, server);
  const champions = await getAllChampions();
	const host = await getHost(server);
	if (!nickname || !server) return msg.channel.stopTyping();
	if (!playerId || !host) {
		await msg.channel.send(
			createEmbed('❌ Incorrect nickname or server', [
				{
					title: '___',
					content: "Check if the data you've provided is correct.",
				},
			]),
		);
		msg.channel.stopTyping();
		return;
	}

	const recentGames = await fetchRecentGames(client, host, playerId);
	if (recentGames.data.matches.length === 0) {
		// No known recent games?
		msg.channel.send(
			createEmbed('❌ Incorrect nickname or server', [
				{
					title: '___',
					content: "Check if the data you've provided is correct.",
				},
			]),
		);
		msg.channel.stopTyping();
		return;
	}

	const [matchBaseData] = recentGames.data.matches;
	const matchId = matchBaseData.gameId;
	const [lastGameData, lastGameTimeline] = await Promise.all([
		fetchMatchInfo(client, host, matchId),
		fetchMatchTimeline(client, host, matchId),
  ]);

  const players: any = lastGameData.data.participantIdentities
    .map((participant: any) => {
      const participant2 = lastGameData.data.participants
        .find(p => p.participantId === participant.participantId);
      return {
        gameId: lastGameData.data.gameId,
        participantId: participant.participantId,
        id: participant.player.accountId,
        name: participant.player.summonerName,
        win: participant2.stats.win,
        teamId: participant2.teamId,
        championId: participant2.championId,
        kills: participant2.stats.kills,
        deaths: participant2.stats.deaths,
        assists: participant2.stats.assists,
        summ1: participant2.spell1Id,
        summ2: participant2.spell2Id,
        fbkill: participant2.stats.firstBloodKill,
        fbassist: participant2.stats.firstBloodAssist,
        role: participant2.timeline.role,
        lane: participant2.timeline.lane,
        queue: lastGameData.data.queueId,
        champion: champions.find(champion => Number(champion.id) === Number(participant2.championId)),
      }}
  );

  const ourPlayer = players.find(player => player.id === playerId);
	const enemies = players.filter(
		player =>
			player.lane === ourPlayer.lane && player.teamId !== ourPlayer.teamId,
	);
	const lane = await findLane(ourPlayer?.lane);
  const queue = await findQueue(ourPlayer?.queue);

	const embed = new Discord.MessageEmbed()
		.setColor(`0x${COLORS.embed.main}`)
		.setThumbnail(
			lane
				? lane.icon
				: 'https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/256x256/question.png',
		)
		.setTimestamp(new Date(matchBaseData.timestamp))
		.setFooter(
			`${queue?.map ?? 'UNKNOWN'}, ${queue?.queue ?? 'UNKNOWN'}`,
			ourPlayer.champion ? ourPlayer.champion.img : lane?.icon,
		);

	if (enemies.length === 0) {
		const content =
			'There was no lane opponent in this game.\nEither it was a bot game, one of the laners roamed a lot or one of the laners was AFK.';
		embed
			.setTitle(
				`${ourPlayer.champion ? ourPlayer.champion.name.toUpperCase() : '???'}`,
			)
			.setDescription(
				`**${ourPlayer.name}** (${
					ourPlayer.champion ? ourPlayer.champion.name : '???'
				})`,
			)
			.addField('Some info', content);
	} else {
		const relevantMinutes = [5, 10, 15];
		const gameFrames: any = {};

		embed
			.setTitle(
				sprintf(
					'%s vs %s',
					ourPlayer.champion?.name.toUpperCase() ?? '???',
					enemies.map(e => e.champion?.name.toUpperCase() ?? '???').join(', '),
				),
			)
			.setDescription(
				sprintf(
					"**%s's** %s %s vs %s in %d minutes",
					ourPlayer?.name ?? '???',
					ourPlayer?.champion?.name.toUpperCase() ?? '???',
					ourPlayer?.win ? 'wins' : 'loses',
					enemies
						.map(enemy => {
							return sprintf(
                "**%s's** %s",
                enemy.name ?? '???',
								enemy.champion?.name.toUpperCase() ?? '???',
							);
						})
						.join(', '),
					Math.round(parseInt(lastGameData.data.gameDuration) / 60),
				),
			);

		relevantMinutes.map((minute: number) => {
			if (lastGameTimeline.data.frames[minute]) {
				const timeline = lastGameTimeline.data.frames[minute].participantFrames;
				const player: any = Object.values(timeline).find(
					(player: any) => player.participantId === ourPlayer.participantId,
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
						(player: any) => player.participantId === enemy.participantId,
					);
					gameFrames[`min${minute}`].enemies.push({
						id: enemy.participantId,
						cs: player.minionsKilled + player.jungleMinionsKilled,
						gold: player.totalGold,
						level: player.level,
					});
				});

				Object.values(timeline).map((player: any) => {
					const currentPlayer = players.find(
						(p: any) => p.participantId === player.participantId,
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
					: '[unknown ally champion]';
        const enemyChampion = enemies.find(enemy =>
          enemy.role === ourPlayer.role && enemy.lane === ourPlayer.lane) ?? enemies[0];
        const enemyChampionName = enemyChampion?.champion?.name ?? '[unknown enemy champion]';
				const playerGold = gameFrames[`min${minute}`].player.gold;
				const playerCs = gameFrames[`min${minute}`].player.cs;
        const enemyCs = gameFrames[`min${minute}`].enemies
          .find(e => e.id === enemyChampion.participantId)?.cs ?? '???';
        const enemyGold = gameFrames[`min${minute}`].enemies
          .find(e => e.id === enemyChampion.participantId)?.gold ?? '???';
				const allyTeamGoldAdvantage =
					gameFrames[`min${minute}`].allyTeam -
					gameFrames[`min${minute}`].enemyTeam;
				const minuteSummary = gameFrames[`min${minute}`]
					? `${playerChampionName} has **${Math.abs(
							playerGold - enemyGold,
					  )}** gold ${
							playerGold - enemyGold > 0 ? 'advantage' : 'disadvantage'
					  }.
                        Creep scores are ${playerChampionName}'s **${playerCs}** to ${enemyChampionName}'s **${enemyCs}**.
                        All other lanes ${
													allyTeamGoldAdvantage >= 0 ? 'win' : 'lose'
												} with **${Math.abs(allyTeamGoldAdvantage)}** gold ${
							allyTeamGoldAdvantage >= 0 ? 'advantage' : 'disadvantage'
					  }.`
					: 'Game ended by now.';
				embed.addField(`Minute ${minute}`, minuteSummary);
			}
		});
	}
	msg.channel.stopTyping();
	msg.channel.send(embed);
};

export const mastery = async (msg: Discord.Message): Promise<void> => {
	msg.channel.startTyping();
	const selfRequest = !extractArguments(msg).length;

	if (selfRequest) {
		const user = await findUserByDiscordId(msg.author.id);
		const accounts = user?.accounts ?? [];
		if (accounts.length !== 0) {
			for (const account of accounts) {
				const host = await getHost(account.server);
				if (!host) {
					continue;
				}
				const { data: summoner } = await getSummonerBySummonerId(
					client,
					host,
					account.id,
				);

				aggregateMasteryData(
					msg,
					summoner.name,
					account.server,
					host,
					summoner,
				);
			}

			return;
		}
		msg.channel.send(
			createEmbed(
				`:information_source: You don't have any accounts registered`,
				[
					{
						title: '___',
						content: `To use this commands without arguments you have to register your League account first: \`\`!register <IGN> | <server>\`\`.
                        Otherwise, this command can be used as follows: \`\`!mastery IGN|server\`\`.`,
					},
				],
			),
		);
	} else {
		const { nickname, server } = extractNicknameAndServer(msg);
		if (nickname === undefined || server === undefined) {
			return;
		}

		const host = await getHost(server);
		if (host === undefined) {
			return;
		}

		const { data: summoner } = await getSummonerByName(client, host, nickname);

		aggregateMasteryData(msg, nickname, server, host, summoner);
	}
};

const aggregateMasteryData = async (
	msg: Discord.Message,
	nickname: string,
	server: string,
	host: string,
	summoner: Summoner,
) => {
	const topX = (await findOption('topMasteries')) ?? 3;
	const masteryIcons = (await findOption('masteryIcons')) ?? [];
	const masteryData = await fetchSummonerMasteries(client, host, summoner);
	const masteryList = orderBy(
		masteryData.data,
		['championPoints'],
		['desc'],
	).slice(0, topX);
	const mostMasteryChampion = masteryList[0]
		? await findChampion(masteryList[0].championId)
		: null;
	const mostMasteryIcon = mostMasteryChampion?.img;
	const collectiveMasteryLevels = { level5: 0, level6: 0, level7: 0 };
	let collectiveMastery = 0;
	masteryData.data.map(d => {
		collectiveMastery = collectiveMastery + d.championPoints;
		[5, 6, 7].includes(d.championLevel)
			? collectiveMasteryLevels[`level${d.championLevel}`]++
			: null;
	});
	let collectiveMasteryLevelsString = '';
	for (const level of Object.keys(collectiveMasteryLevels)) {
		const icon = masteryIcons.find(
			mI => level.indexOf(mI.mastery.toString()) !== -1,
		);
		collectiveMasteryLevelsString += `${icon?.emote} x${collectiveMasteryLevels[level]} `;
	}

	const embed = new Discord.MessageEmbed()
		.setTitle(
			`Top ${topX} masteries - ${nickname.toUpperCase()} [${server.toUpperCase()}]`,
		)
		.setDescription(
			`${collectiveMasteryLevelsString}\n**Collective mastery**: ${collectiveMastery}`,
		)
		.setTimestamp(new Date())
		.setFooter(msg.author.username)
		.setColor(`0x${COLORS.embed.main}`);

	if (mostMasteryIcon !== undefined) {
		embed.setThumbnail(mostMasteryIcon);
	}

	const iterateChampionMasteries = async (index: number) => {
		const mastery = masteryList[index];
		const champion = await findChampion(mastery.championId);
		if (champion === undefined) {
			console.log(':3');
			return;
		}

		const masteryIcon = masteryIcons.find(
			mI => mI.mastery === mastery.championLevel,
		);
		let title = `${champion.name}, ${champion.title}`;
		if (masteryIcon)
			title = `${masteryIcon.emote} ${title} ${
				mastery.chestGranted ? '<:chest_unlocked:672434420195655701>' : ''
			}`;
		embed.addField(
			title,
			`**Points**: ${mastery.championPoints}\n` +
				`**Last game**: ${new Date(mastery.lastPlayTime).toLocaleDateString()}`,
			false,
		);
		if (masteryList.length > index + 1) {
			iterateChampionMasteries(index + 1);
		} else {
			msg.channel.send(embed);
			msg.channel.stopTyping();
		}
	};
	iterateChampionMasteries(0);
};
