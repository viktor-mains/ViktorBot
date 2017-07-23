exports.Race = function (data, post) {
    var race = this;

    race.join = function (rankDesiredAndCurrent) {
        post.message(`This isn't implemented yet. Ping Arcyvilk to be added manually.`); 
    };

    race.leaderboards = function (rankDesired, rankCurrent) {
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

            race.updateRace(raceJson, rankDesired, rankCurrent, updatedRaceJson => {
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
                    participants += `\`\`#${input.justifyToLeft(parseInt(i) + 1, 2)}: ${rankCurrent.toUpperCase()} ${swap.romanToArabic(updatedRaceJson.Participants[i].division)} ` +
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
                    [`Winners:`, `${winners}`, false], [`___`, `\n\nTo join the ${rankDesired} Race, write **!${rankDesired.toLowerCase()}race add <IGN>|<server>** . ` +
                        `Disclaimer: you have to be ${rankCurrent}.`, false]]);
            });
        });
    };
    race.updateRace = function (raceJson, rankDesired, rankCurrent, callback) {
        race.assignRankPoints(raceJson, rankDesired, rankCurrent, updatedRaceJson => {
            if (updatedRaceJson.toString() == `error`)
                return;
            race.checkForNewWinners(updatedRaceJson, rankDesired, newWinnersAssigned => {
                newWinnersAssigned.Participants = race.sortByPoints(newWinnersAssigned.Participants, `points`);
                callback(newWinnersAssigned);
                race.saveUpdateInFile(newWinnersAssigned, rankDesired);
            });
        });
    };
    race.assignRankPoints = function (raceJson, rankDesired, rankCurrent, callback) {
        var Swap = require('./swap.js');
        var swap = new Swap.Swap();
        var API = require('./API.js');
        var api = new API.API();

        function raceLoop(i) {
            if (i < raceJson.Participants.length) {
                var server = swap.serverToEndPoint(raceJson.Participants[i].server);
                var playerID = raceJson.Participants[i].id;

                api.extractNewPlayerRanksData(server, playerID, rankJson => {
                    if (rankJson.toString().startsWith(`:warning:`)) {
                        post.message(`:warning: Error while downloading ${raceJson.Participants[i].nickname}'s data.`);
                        callback(`error`);
                        return;
                    };
                    raceJson.Participants[i].division = rankJson[0].rank;
                    raceJson.Participants[i].leaguePoints = rankJson[0].leaguePoints;
                    raceJson.Participants[i].points = race.calculatePlayerRacePoints(rankJson[0], rankDesired, rankCurrent);

                    if (i == raceJson.Participants.length - 1) 
                        callback(raceJson);
                    return raceLoop(i + 1);
                });
            };
        };
        raceLoop(0);
    };
    race.calculatePlayerRacePoints = function (rankJson, rankDesired, rankCurrent) {
        var Swap = require('./swap.js');
        var swap = new Swap.Swap();
        var division = swap.romanToArabic(rankJson.rank)*100;
        var points = rankJson.leaguePoints;
        var racePoints = division - points;

        if (rankJson.tier.toLowerCase() != rankCurrent.toLowerCase()) //if someone demoted - something wrong with it
            racePoints = -1;
        if (rankJson.tier.toLowerCase() == rankDesired.toLowerCase()) //if someone won
            racePoints = 1000;
        return racePoints;
    };
    race.checkForNewWinners = function (updatedRaceJson, rankDesired, callback) {
        for (i in updatedRaceJson.Participants) {
            if (updatedRaceJson.Participants[i].points == 1000) { //someone won and didn't get moved yet
                post.embed(`💐 NEW WINNER 💐`, [[`___`, `${updatedRaceJson.Participants[i].nickname} won the ${rankDesired.toUpperCase()} race! Congratulations 🎈🎈🎈`, false]]);
                delete updatedRaceJson.Participants[i].points;
                delete updatedRaceJson.Participants[i].division;
                delete updatedRaceJson.Participants[i].leaguePoints;
                
                updatedRaceJson.Participants[i].place = updatedRaceJson.Winners.length + 1;
                updatedRaceJson.Winners.push(updatedRaceJson.Participants[i]);
                updatedRaceJson.Participants.splice(i, 1);
            };
        };
        callback(updatedRaceJson);
    };
    race.saveUpdateInFile = function (newJson, rankDesired) {
        var dummyJson = newJson;
        var fs = require(`fs`);
        var racePath = `../data/race/${rankDesired.toLowerCase()}race.json`;

        for (i in dummyJson.Participants) {
            delete dummyJson.Participants[i].points;
            delete dummyJson.Participants[i].division;
            delete dummyJson.Participants[i].leaguePoints;
        };  
        fs.writeFile(racePath, JSON.stringify(dummyJson), err => {
            if (err) {
                var d = new Date();
                console.log(`${d} - saving new winner - ${err}`);
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