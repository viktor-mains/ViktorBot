var API = require('./API.js');
var Swap = require('./swap.js');

exports.Race = function (data, post) {
    var race = this;

    race.join = function (rankDesiredAndCurrent) {
        post.message(`This isn't implemented yet. Ping Arcyvilk to be added manually.`); 
    };

    race.leaderboards = function (rankDesired, rankCurrent) {
        post.message(`:hourglass_flowing_sand: Getting the ${rankDesired} race data. This might take a while...`);

        var data;
        fs = require(`fs`);
        fs.readFile(`./race_data/${rankDesired.toLowerCase()}race.vik`, `utf8`, function (err, fileContents) {
            if (err)
                return post.message(`Cannot retrieve data because ${err}.`);

            var fetched = fileContents.split(`#`);
            var api = new API.API();
            var swap = new Swap.Swap();
            var playerNickIDAndServer = [];
            var m = ``; //fetched info here
            var winners = `None yet - you can be first!`;

            for (var i = 0; i < fetched.length; i++) {
                if (i < fetched.length - 1) {
                    var p = fetched[i].split("|");
                    playerNickIDAndServer[i] = [p[0], p[1], p[2], `0`, `0`]; //0=nick, 1=id, 2=server, 3=points towards classification, 4=description
                    continue;
                }
                function ApiLoop(i) {
                    if (i < playerNickIDAndServer.length) {
                        var playerID = playerNickIDAndServer[i][1];
                        var playerServer = playerNickIDAndServer[i][2]; 
                        api.extractPlayerRanksData(playerServer, playerID, ranksAPI => {
                            if (ranksAPI.toString().startsWith(`:warning:`))
                                return post.message(ranksAPI);
                            var playerDivision = swap.romanToArabic((ranksAPI[playerID][0]).entries[0].division);
                            var playerLP = (ranksAPI[playerID][0]).entries[0].leaguePoints;
                            if (playerLP < 10)
                                playerLP = ` ${playerLP}`;
                            if (playerLP < 100)
                                playerLP = ` ${playerLP}`;

                            playerNickIDAndServer[i][4] = `${(ranksAPI[playerNickIDAndServer[i][1]][0]).tier} ${playerDivision} - ${playerLP} LP |\`\` ${playerNickIDAndServer[i][0]}`;
                            if (((ranksAPI[playerID][0]).tier).toLowerCase() == rankCurrent.toLowerCase())
                                playerNickIDAndServer[i][3] = 100 * playerDivision - playerLP;
                            else {
                                winners = ``;
                                playerNickIDAndServer[i][3] = 999;
                            }
                            return ApiLoop(i + 1);
                        });
                    }
                    else {
                        try {
                            for (var j = 0; j < playerNickIDAndServer.length; j++) {
                                if (j < playerNickIDAndServer.length - 1) {
                                    for (var k = 0; k < playerNickIDAndServer.length - 1; k++) {
                                        if (playerNickIDAndServer[k][3] > playerNickIDAndServer[k + 1][3]) {
                                            var pom = playerNickIDAndServer[k];
                                            playerNickIDAndServer[k] = playerNickIDAndServer[k + 1];
                                            playerNickIDAndServer[k + 1] = pom;
                                        }
                                    }
                                }
                                else {
                                    for (var k = 0; k < playerNickIDAndServer.length; k++) {
                                        if (playerNickIDAndServer[k][3] < 999) {
                                            if (k+1 < 10)
                                                m += `\n\`\`#${k + 1}:  ${playerNickIDAndServer[k][4]}`;
                                            else
                                                m += `\n\`\`#${k + 1}: ${playerNickIDAndServer[k][4]}`;
                                        }
                                        else
                                            winners += `:medal: ${playerNickIDAndServer[k][0]}\n`;
                                    }

                                    return post.embed(`:trophy: ${rankDesired} Race!`,
                                        [[`___`,
                                            `${m}`, false], [`Winners:`, `${winners}`, false], [`___`, `\n\nTo join the ${rankDesired} Race, write **!${rankDesired.toLowerCase()}race add <IGN>|<server>** . ` +
                                            `Disclaimer: you have to be ${rankCurrent }.`,
                                            false]]);
                                }
                            }
                        }
                        catch (err) {
                            return post.message(`Oops. ${err}$`);
                        }
                    }
                }
                ApiLoop(0);
            }
        });
    };
};