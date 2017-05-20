var Swap = require('./swap.js');

exports.API = function () {
    var api = this;
    var swap = new Swap.Swap();

    api.RITO_KEY = process.env.RITO_KEY;

    api.URLsummonerID = function (server, playerIGN) {
        return `https://${server}.api.riotgames.com/lol/summoner/v3/summoners/by-name/${playerIGN}?api_key=${api.RITO_KEY}`;
    };
    api.URLmasteryData = function (server, playerID) {
        return `https://${server}.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/${playerID}/by-champion/112?api_key=${api.RITO_KEY}`
    };
    api.URLliveGameData = function (server, playerID) {
        return `https://${server}.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/${playerID}?api_key=${api.RITO_KEY}`;
    };
    api.playersRanksData = function (server, playerIDs) {
        return `https://${server}.api.riotgames.com/api/lol/${server}/v2.5/league/by-summoner/${playerIDs}/entry?api_key=${api.RITO_KEY}`;
    };
    api.URLchampionData = function (server) {
        return `https://${server}.api.riotgames.com/lol/static-data/v3/champions?dataById=true&api_key=${api.RITO_KEY}`;
    };


    api.extractChampionData = function (server, callback) {
        api.extractFromURL(api.URLchampionData(server), championDataAPI => {
            if (!api.everythingOkay(championDataAPI))
                return callback(":warning: Error retrieving champion data.");
            return callback(JSON.parse(championDataAPI));
        });
    };
    api.extractPlayerRanksData = function (server, playerIDs, callback) {
        api.extractFromURL(api.playersRanksData(server, playerIDs), ranksAPI => {
            if (!api.everythingOkay(ranksAPI))
                return callback(`:warning: Error retrieving ranks data.`);
            return callback(JSON.parse(ranksAPI));
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
            if (!api.everythingOkay(playerIDAPI))
                return callback(`:warning: Player ${decodeURIComponent(playerIGNAndServer[0]).toUpperCase()} doesn't exist.`);
            return callback((JSON.parse(playerIDAPI)).id.toString());
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
        return false;
    };
};