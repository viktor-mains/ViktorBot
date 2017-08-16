exports.Race = function (data, post) {
    var race = this;

    race.join = function (rankDesiredCurrentAndLower) {
        post.message(`This isn't implemented yet. Ping Arcyvilk to be added manually.`); 
    };

    race.leaderboards = function (rankDesired, rankCurrent, rankLower) {
        post.message(`:hourglass_flowing_sand: Getting the ${rankDesired} race data. This might take a while...`);

        var fs = require(`fs`);
        var Input = require('./input.js');
        var input = new Input.Input();
        var Swap = require('./swap.js');
        var swap = new Swap.Swap();
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
                    participants += `\`\`${input.justifyToLeft(`#${parseInt(i) + 1}:`, 4)} ${rankCurrent.toUpperCase()} ${swap.romanToArabic(updatedRaceJson.Participants[i].division)} ` +
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
                    [`Winners:`, `${winners}`, false], [`___`, `\n\n~~To join the ${rankDesired} Race, write **!${rankDesired.toLowerCase()}race add <IGN>|<server>**~~ ` +
                        `Currently manual joining is unavailable - to join the race, ping Arcyvilk with your IGN and server. \n\n` +
                        `Disclaimer: you have to be ${rankCurrent} and have Viktor in your top 3 played champions this season.`, false]]);
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
        var Swap = require('./swap.js');
        var swap = new Swap.Swap();
        var API = require('./API.js');
        var api = new API.API();

        var l = raceJson.Participants.length;

        function raceLoop(i) {
            if (i < l) {
                var server = swap.serverToEndPoint(raceJson.Participants[i].server);
                var playerID = raceJson.Participants[i].id;

                api.extractPlayerRanksData(server, playerID, rankJson => {
                    if (rankJson.toString().startsWith(`:warning:`)) {
                        post.message(rankJson);
                        callback(`error`);
                        return;
                    };
                    raceJson.Participants[i].division = rankJson[0].rank;
                    raceJson.Participants[i].leaguePoints = rankJson[0].leaguePoints;
                    raceJson.Participants[i].points = race.calculatePlayerRacePoints(rankJson[0], rankDesired, rankCurrent, rankLower);

                    if (i == l - 1) 
                        callback(raceJson);
                    return raceLoop(i + 1);
                });
            };
        };
        raceLoop(0);
    };
    race.calculatePlayerRacePoints = function (rankJson, rankDesired, rankCurrent, rankLower) {
        var Swap = require('./swap.js');
        var swap = new Swap.Swap();
        var division = swap.romanToArabic(rankJson.rank)*100;
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