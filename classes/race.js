var Swap = require('./swap')

exports.Race = function (data, post) {
    var race = this;

    race.join = function (rankDesiredCurrentAndLower) {
        var fs = require(`fs`);
        var Roles = require('./roles.js');
        var roles = new Roles.Roles(data.message.member);
        var Input = require('./input.js');
        var input = new Input.Input();
        var API = require('./API.js');
        var api = new API.API();

        var playerIGNAndServer;
        var server;
        var playerNickDecoded;
        var rankDesired = rankDesiredCurrentAndLower[0];
        var rankCurrent = rankDesiredCurrentAndLower[1];
        var msg = input.removeKeyword(data.message.content).substring(4).trim();
        var racePath = `../data/race/${rankDesired.toLowerCase()}race.json`;

        if (!roles.userHasRole('Junior Assistant') && !roles.userHasRole('Hextech Progenitor'))
            return post.message(`:warning: Only members of community can join races! Participate a bit more before joining. Junior Assistant has a very low requirement to get!`);
        if (msg.indexOf(`<`) !== -1)
            return post.message(`**<** and **>** is supposed to indicate that this is a part where you put your IGN and server. You don't _literally_  ` +
                `put **<** and **>** there. <:vikfacepalm:305783369302802434>`);
        if (!input.hasSeparator(msg))
            return post.message(`:warning: This command requires the symbol \"**|**\" to separate region from nickname. \n_Example:_ \`\`!${rankDesired.toLowerCase()}race ${data.message.author.username}|euw\`\``);

        post.message(`:hourglass_flowing_sand: This might take a while...`);

        playerIGNAndServer = msg.split('|');
        playerIGNAndServer[0] = playerIGNAndServer[0].trim();
        playerIGNAndServer[1] = playerIGNAndServer[1].trim();
        playerIGNAndServer[0] = input.getRidOfSpecialSymbols(playerIGNAndServer[0]);
        playerNickDecoded = input.readdSpecialSymbols(playerIGNAndServer[0]).toUpperCase();
        server = SAwap.serverToEndPoint(playerIGNAndServer[1]);

        api.extractPlayerID(server, playerIGNAndServer, playerID => {
            if (playerID.toString().startsWith(`:warning:`))
                return post.message(playerID);
            api.extractPlayerRanksData(server, playerID, ranksData => {
                if (ranksData.toString().startsWith(`:warning:`))
                    return post.message(ranksData);

                function checkForSoloQStats(i) {
                    if (ranksData.length <= i)
                        return post.message(`:warning: Player ${playerNickDecoded} is unranked. To join the race, you need to be ranked exactly one tier below the desired tier (example: to join Diamond race you need to be Platinum).`);

                    if (ranksData[i].queueType == 'RANKED_SOLO_5x5') {
                        if (ranksData[i].tier.toLowerCase() != rankCurrent.toLowerCase())
                            return post.message(`:warning: To join the race, you need to be ranked exactly one tier below the desired tier (example: to join Diamond race you need to be Platinum).`);
                        fs.readFile(racePath, 'utf8', (err, fileData) => {
                            if (err)
                                return post.message(`:warning: Something went wrong during saving your data. Try joining the race later.`);
                            fileData = JSON.parse(fileData);
                            for (participant in fileData.Participants) {
                                if (fileData.Participants[participant].nickname == playerNickDecoded)
                                    return post.message(`:warning: Player ${playerNickDecoded} already participates in this race.`);
                            }
                            fileData.Participants.push({
                                "nickname": playerNickDecoded,
                                "id": playerID,
                                "server": playerIGNAndServer[1].toUpperCase()
                            });
                            fs.writeFile(racePath, JSON.stringify(fileData), err => {
                                if (err)
                                    return post.message(`:warning: Something went wrong during saving your data. Try joining the race later.`);
                                return post.message(`Player ${playerNickDecoded} succesfully joined the ${rankDesired} race.`);
                            });
                        });
                    }
                    else
                        checkForSoloQStats(i + 1);
                }
                checkForSoloQStats(0);
            });
        });

    };

    race.leaderboards = function (rankDesired, rankCurrent, rankLower) {
        post.message(`:hourglass_flowing_sand: Getting the ${rankDesired} race data. This might take a while...`);

        var fs = require(`fs`);
        var Input = require('./input.js');
        var input = new Input.Input();
        var racePath = `../data/race/${rankDesired.toLowerCase()}race.json`;

        fs.readFile(racePath, `utf8`, function (err, raceJson) {
            if (err)
                return post.message(`Cannot retrieve data because ${err}.`);
            raceJson = JSON.parse(raceJson);
            var participants = `None yet!`;
            var winners = `None yet!`;

            race.updateRace(raceJson, rankDesired, rankCurrent, rankLower, updatedRaceJson => {
                if (updatedRaceJson.Winners.length > 0)
                    winners = ``;
                if (updatedRaceJson.Participants.length > 0)
                    participants = ``;

                for (i in updatedRaceJson.Participants) {
                    try {
                        var LP = input.justifyToRight(updatedRaceJson.Participants[i].leaguePoints.toString(), 3);
                    }
                    catch (err) {
                        return post.embed(`:warning: Error`, [[`___`, `Can't read ${updatedRaceJson.Participants[i].nickname}'s data. Try again in a few moments.`, false]]);
                    }
                    participants += `\`\`${input.justifyToLeft(`#${parseInt(i) + 1}:`, 4)} ${rankCurrent.toUpperCase()} ${Swap.romanToArabic(updatedRaceJson.Participants[i].division)} ` +
                        `- ${LP } LP |\`\` ${updatedRaceJson.Participants[i].nickname}\n`;
                };
                for (i in updatedRaceJson.Winners) {
                    if (updatedRaceJson.Winners[i].place > 3) {
                        winners += `:medal: ${updatedRaceJson.Winners[i].nickname}\n`;
                        continue;
                    };
                    var place = ``;
                    updatedRaceJson.Winners[i].place == 1 ? place = `first` : (updatedRaceJson.Winners[i].place == 2 ? place = `second` : place = `third`);
                    winners += `:${place}_place: ${updatedRaceJson.Winners[i].nickname}\n`;
                };

                return post.embed(`:trophy: ${rankDesired} Race!`, [
                    [`Participants:`, `${participants}`, false],
                    [`Winners:`, `${winners}`, false], [`___`, `\n\nTo join the ${rankDesired} Race, write **!${rankDesired.toLowerCase()}race join <IGN>|<server>** `+
                        `Disclaimer: you have to be ${rankCurrent} and have a membership role confirming that you're a member of our community.`, false]]);
            });
        });
    };
    race.updateRace = function (raceJson, rankDesired, rankCurrent, rankLower, callback) {
        if (raceJson.Participants.length > 0) {
            race.assignRankPoints(raceJson, rankDesired, rankCurrent, rankLower, updatedRaceJson => {
                if (updatedRaceJson.toString() == `error`)
                    return;
                race.checkForRankMoves(updatedRaceJson, rankDesired, rankCurrent, rankLower, newWinnersAssigned => {
                    newWinnersAssigned.Participants = race.sortByPoints(newWinnersAssigned.Participants, `points`);
                    callback(newWinnersAssigned);
                    race.saveUpdateInFile(newWinnersAssigned, `../data/race/${rankDesired.toLowerCase()}race.json`);
                });
            });
        }
        else
            return callback (raceJson);
    };
    race.assignRankPoints = function (raceJson, rankDesired, rankCurrent, rankLower, callback) {
        var API = require('./API.js');
        var api = new API.API();

        var l = raceJson.Participants.length;

        function raceLoop(i) {
            if (i < l) {
                var server = Swap.serverToEndPoint(raceJson.Participants[i].server);
                var playerID = raceJson.Participants[i].id;

                api.extractPlayerRanksData(server, playerID, rankJson => {
                    if (rankJson.toString().startsWith(`:warning:`)) {
                        post.message(rankJson);
                        callback(`error`);
                        return;
                    };
                    for (prop in rankJson) {
                        if (rankJson[prop].queueType == "RANKED_SOLO_5x5") {
                            raceJson.Participants[i].division = rankJson[prop].rank;
                            raceJson.Participants[i].leaguePoints = rankJson[prop].leaguePoints;
                            raceJson.Participants[i].points = race.calculatePlayerRacePoints(rankJson[prop], rankDesired, rankCurrent, rankLower);
                            break;
                        }
                    }

                    if (i == l - 1)
                        callback(raceJson);
                    return raceLoop(i + 1);
                });
            };
        };
        raceLoop(0);
    };
    race.calculatePlayerRacePoints = function (rankJson, rankDesired, rankCurrent, rankLower) {
        var division = Swap.romanToArabic(rankJson.rank)*100;
        var points = rankJson.leaguePoints;
        var racePoints = division - points;

        if (rankJson.tier.toLowerCase() == rankLower.toLowerCase()) //if someone demoted
            racePoints = 2000;
        if (rankJson.tier.toLowerCase() == rankDesired.toLowerCase()) //if someone won
            racePoints = 1000;
        return racePoints;
    };
    race.checkForRankMoves = function (updatedRaceJson, rankDesired, rankCurrent, rankLower, callback) {
        var indexesToRemove = [];
        var l = updatedRaceJson.Participants.length;

        function updateLoop(i) {
            if (i < l) {
                if (updatedRaceJson.Participants[i].points == 1000) {
                    post.embed(`💐 NEW WINNER 💐`, [[`___`, `${updatedRaceJson.Participants[i].nickname} won the ${rankDesired.toUpperCase()} race! Congratulations 🎈🎈🎈`, false]]);
                    updatedRaceJson.Participants[i].place = updatedRaceJson.Winners.length + 1;
                    updatedRaceJson.Winners.push(updatedRaceJson.Participants[i]);
                    indexesToRemove.push(i);
                    return updateLoop(i + 1);
                }
                else if (updatedRaceJson.Participants[i].points == 2000) {
                    var fs = require(`fs`);
                    var lowerRacePath = `../data/race/${rankCurrent.toLowerCase()}race.json`;

                    post.embed(`💐 NEW LOSER 💐`, [[`___`, `Congratulations! ${updatedRaceJson.Participants[i].nickname} managed to demote to ${rankLower.toUpperCase()}! 🎈🎈🎈`, false]]);
                    fs.readFile(lowerRacePath, 'utf8', (err, lowerRaceJson) => {
                        if (err) {
                            var d = new Date();
                            return console.log(`${d} - error while reading lower rank json - ${err}`);
                        };
                        lowerRaceJson = JSON.parse(lowerRaceJson);
                        lowerRaceJson.Participants.push(updatedRaceJson.Participants[i]);

                        race.saveUpdateInFile(lowerRaceJson, lowerRacePath);
                        indexesToRemove.push(i);
                        return updateLoop(i + 1);
                    });
                }
                else
                    return updateLoop(i + 1);
            };
            if (i == l) {
                for (j in indexesToRemove)
                    updatedRaceJson.Participants.splice(indexesToRemove[j], 1);
                return callback(updatedRaceJson);
            };
        };
        updateLoop(0);
    };
    race.saveUpdateInFile = function (jsonToSave, racePath) {
        var fs = require(`fs`);

        for (i in jsonToSave.Participants) {
            delete jsonToSave.Participants[i].points;
            delete jsonToSave.Participants[i].division;
            delete jsonToSave.Participants[i].leaguePoints;
        };
        for (i in jsonToSave.Winners) {
            delete jsonToSave.Winners[i].points;
            delete jsonToSave.Winners[i].division;
            delete jsonToSave.Winners[i].leaguePoints;
        };
        fs.writeFile(racePath, JSON.stringify(jsonToSave), err => {
            if (err) {
                var d = new Date();
                console.log(`${d} - saving updated race to file - ${err}`);
            }
        });
    };
    race.sortByPoints = function (array, key) {
        return array.sort(function (a, b) {
            var x = a[key];
            var y = b[key];

            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };
};