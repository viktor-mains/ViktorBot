var Swap = require('./swap.js');
var Input = require('./input.js');

exports.API = function () {
    var api = this;
    var swap = new Swap.Swap();
    var input = new Input.Input();

    api.RITO_KEY = process.env.RITO_KEY;


    api.URLmatchData = function (server, matchID) {
        return `https://${server}.api.riotgames.com/lol/match/v3/matches/${matchID}?api_key=${api.RITO_KEY}`;
    };
    api.URLrecentGamesData = function (server, accountID) {
        return `https://${server}.api.riotgames.com/lol/match/v3/matchlists/by-account/${accountID}/recent?api_key=${api.RITO_KEY}`;
    };
    api.URLsummonerID = function (server, playerIGN) {
        return `https://${server}.api.riotgames.com/lol/summoner/v3/summoners/by-name/${playerIGN}?api_key=${api.RITO_KEY}`;
    };
    api.URLmasteryData = function (server, playerID) {
        return `https://${server}.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/${playerID}/by-champion/112?api_key=${api.RITO_KEY}`
    };
    api.URLliveGameData = function (server, playerID) {
        return `https://${server}.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/${playerID}?api_key=${api.RITO_KEY}`;
    };
    api.playersRanksData = function (server, playerID) {
        return `https://${server}.api.riotgames.com/lol/league/v3/positions/by-summoner/${playerID}?api_key=${api.RITO_KEY}`;
    };
    api.URLchampionData = function (server) {
        return `https://${server}.api.riotgames.com/lol/static-data/v3/champions?dataById=true&api_key=${api.RITO_KEY}`;
    };

    
    api.extractPlayerRanksData = function (server, playerID, callback) {
        api.extractFromURL(api.playersRanksData(server, playerID), ranksAPI => {
            if (ranksAPI == `error 403`)
                return callback(`:warning: The key expired.`);
            if (!api.everythingOkay(ranksAPI))
                return callback(`:warning: Error retrieving ranks data.`);
            return callback(JSON.parse(ranksAPI));
        });
    };
    api.extractMatchData = function (server, matchID, callback) {
        api.extractFromURL(api.URLmatchData(server, matchID), matchDataAPI => {
            if (!api.everythingOkay(matchDataAPI))
                return callback(":warning: Error retrieving match data.");
            return callback(JSON.parse(matchDataAPI));
        });
    };
    api.extractRecentGamesData = function (server, accountID, callback) {
        api.extractFromURL(api.URLrecentGamesData(server, accountID), gamesDataAPI => {
            if (!api.everythingOkay(gamesDataAPI))
                return callback(":warning: Error retrieving recent games data.");
            return callback(JSON.parse(gamesDataAPI));
        });
    };
    api.extractChampionData = function (server, callback) {
        api.extractFromURL(api.URLchampionData(server), championDataAPI => {
            if (!api.everythingOkay(championDataAPI))
                return callback(":warning: Error retrieving champion data.");
            return callback(JSON.parse(championDataAPI));
        });
    };
    api.extractPlayersLiveGameData = function (server, playerID, callback) {
        api.extractFromURL(api.URLliveGameData(server, playerID), liveGameDataAPI => {
            if (!api.everythingOkay(liveGameDataAPI)) 
                return callback(`:warning: This person either is not in game, or you did something wrong.`);
            return callback(JSON.parse(liveGameDataAPI));
        });
    };
    api.extractPlayerID = function (server, playerIGNAndServer, callback) {
        api.extractFromURL(api.URLsummonerID(server, playerIGNAndServer[0]), playerIDAPI => {
            if (playerIDAPI == `error 403`)
                return callback(`:warning: The key expired.`);
            if (!api.everythingOkay(playerIDAPI))
                return callback(`:warning: Player ${decodeURIComponent(playerIGNAndServer[0]).toUpperCase()} doesn't exist.`);
            return callback((JSON.parse(playerIDAPI)).id.toString());
        });
    };
    api.extractPlayerAccountID = function (server, playerIGNAndServer, callback) {
        api.extractFromURL(api.URLsummonerID(server, playerIGNAndServer[0]), playerIDAPI => {
            if (playerIDAPI == `error 403`)
                return callback(`:warning: The key expired.`);
            if (!api.everythingOkay(playerIDAPI))
                return callback(`:warning: Player ${decodeURIComponent(playerIGNAndServer[0]).toUpperCase()} doesn't exist.`);
            return callback((JSON.parse(playerIDAPI)).accountId.toString());
        });
    };
    api.extractPlayerMastery = function (server, playerID, callback) {
        api.extractFromURL(api.URLmasteryData(server, playerID), championMasteryDataAPI => {
            if (!api.everythingOkay(championMasteryDataAPI))
                return callback(`:warning: This person didn't play a single game of me. _Phew_.`);

            var mastery = JSON.parse(championMasteryDataAPI);
            var chest = mastery.chestGranted;
            var comment = ``;

            if (!chest) comment = `...how the hell you don't have a chest yet? <:vikwat:269523937669545987>`;
            if (mastery.championLevel <= 4) comment = `...only level ${mastery.championLevel}? Come on. You need to step up your game.`;
            if (mastery.championPoints >= "500000") comment = `Your dedication... is admirable.`;
            if (mastery.championPoints >= "1000000") comment = `You're amongst the most loyal acolytes. You deserve a cookie. :cookie:`;
            if (mastery.championPoints >= "100000" && mastery.championLevel < 6) comment = `Over 100k points and yet, still no level 7. _sighs heavily_`;

            if (chest == true)
                chest = ":white_check_mark:";
            else chest = ":negative_squared_cross_mark:";

            return callback(`\n**Level**: ${swap.numberToNumberEmoji(mastery.championLevel)}` +
                `\n**Points**: ${mastery.championPoints}` +
                `\n**Chest**: ${chest}` +
                `\n\n ${comment}`);
        });
    };
    api.lastGameSummary = function (matchData, server, callback) {
        var gameSummary = `${matchData.gameMode}${swap.gameModeIDToName(matchData.queueId)} [${input.convertMinutesToHoursAndMinutes(matchData.gameDuration)}]`;
        var blueTeam = `\`\`.       |    KDA   |  gold |    dmg | lv |\`\`\n\`\`------------------------------------------\`\`\n`;
        var redTeam = `\`\`.       |    KDA   |  gold |    dmg | lv |\`\`\n\`\`------------------------------------------\`\`\n`;
        api.extractChampionData(server, championDataAPI => {
            if (championDataAPI.toString().startsWith(`:warning:`))
                return callback("error", championDataAPI);
            var champions = championDataAPI;
            for (var i = 0; i < matchData.participants.length; i++) {

                var player = matchData.participants[i];
                var kda = `${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}`;
                var level = `${player.stats.champLevel}`;
                var gold = `${player.stats.goldEarned}`;
                var damage = `${player.stats.totalDamageDealtToChampions}`;
                var summonerSpells = `${swap.spellIDToSpellIcon(player.spell1Id)}${swap.spellIDToSpellIcon(player.spell2Id)}`;

                var playerNick = api.returnsNickIfRankedGame(matchData,i);

                if (player.teamId == 100) {
                    blueTeam += `${summonerSpells} \`\`| ${input.justifyToRight(kda, 8)} | ${input.justifyToRight(gold, 5)} | ${input.justifyToRight(damage, 6)} | ${input.justifyToRight(level, 2)} ` +
                        `| \`\` **${champions.data[player.championId].name}** ${playerNick} \n`;
                }
                else {
                    redTeam += `${summonerSpells} \`\`| ${input.justifyToRight(kda, 8)} | ${input.justifyToRight(gold, 5)} | ${input.justifyToRight(damage, 6)} | ${input.justifyToRight(level, 2)} ` +
                        `| \`\` **${champions.data[player.championId].name}** ${playerNick} \n`;
                }
            };
            return callback(`${gameSummary}`,
                [[api.blueTeamSummary(matchData), blueTeam, false],
                [api.redTeamSummary(matchData), redTeam, false]]);
        });
    };
    api.blueTeamSummary = function (matchData) {
        var blueTeamSummary = `<:turretblue:316314784532398080>${matchData.teams[0].towerKills} ` +
            `<:inhibblue:316314783924092930> ${matchData.teams[0].inhibitorKills} ` +
            `<:dragonblue:316314783596937218>${matchData.teams[0].dragonKills} ` +
            `<:baronblue:316314783874023434> ${matchData.teams[0].baronKills} ` +
            `<:heraldblue:316314784138002442> ${matchData.teams[0].riftHeraldKills} `;
        if (api.whichTeamWon(matchData) == `BLUE`)
            blueTeamSummary += `\`\`.......\`\`:trophy:`;
        return blueTeamSummary;
    };
    api.redTeamSummary = function (matchData) {
        var redTeamSummary = `<:turretred:316314784465420290>${matchData.teams[1].towerKills} ` +
            `<:inhibred:316314784146653185> ${matchData.teams[1].inhibitorKills} ` +
            `<:dragonred:316314783915835393>${matchData.teams[1].dragonKills} ` +
            `<:baronred:316314783634685952> ${matchData.teams[1].baronKills} ` +
            `<:heraldred:316314784209305600> ${matchData.teams[1].riftHeraldKills} `;
        if (api.whichTeamWon(matchData) == `RED`)
            redTeamSummary += `\`\`.......\`\`:trophy:`;
        return redTeamSummary;
    };
    api.returnsNickIfRankedGame = function (matchData,i) {
        try {
            return `- ${matchData.participantIdentities[i].player.summonerName}`;
        }
        catch (err) {
            return ``;
        }
    };
    api.whichTeamWon = function (matchData) {
        if (matchData.teams[0].win == `Win`)
            return `BLUE`;
        return `RED`;
    };



    api.extractFromURL = function (url, callback) {
        var request = require('request');
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200)
                return callback(body);
            else {
                try {
                    return callback("error " + response.statusCode);
                }
                catch (err) {
                    return callback("error" + err);
                }
            }
        });
    }
    api.everythingOkay = function (input) {
        if (!input.startsWith('error'))
            return true;
        console.log(input.toString());
        return false;
    };
};