var request = require("request")
var Swap = require("./swap.js")
var input = require("./input.js")
const url = require("url")

/**
 * Sends a request to the given URL and calls the callback when it receives a response.
 *
 * @param {String} url The url to send a request to.
 * @param {Object} [headers] A list of headers to supply to the server. This may be omitted.
 * @param {Function} cb A callback function. This follows typical node conventions: The first argument will be an error (In this case, an error String) if one occurred, otherwise it will be undefined and the second argument will be the retrieved data.
 */
function extractFromUrl(url, headers, cb) {
  // Allows for omission of the 'headers' argument.
  if (typeof headers === "function") {
    cb = headers
    headers = {}
  }

  if (typeof headers !== "object") {
    throw new TypeError("if headers are specified, they must be an object")
  }

  const options = { url, headers }
  request(options, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      return cb(undefined, error)
    }

    // TODO: Why is this try/catch here?
    try {
      return callback("error " + response.statusCode)
    } catch (err) {
      return callback("error " + err)
    }
  })
}

/**
 * Makes a request to the Riot API Servers.
 * This will automatically append the Riot API key to the request.
 * @param {String} server The server to send the request to.
 * @param {String} path The path of the server to request.
 * @param {Function} cb A callback function. This follows typical node conventions: The first argument will be an error (In this case, an error String) if one occurred, otherwise it will be undefined and the second argument will be the retrieved data.
 */
function makeRiotRequest(server, path, cb) {
  const headers = {
    "X-Riot-Token": process.env.RITO_KEY
  }

  const uri = url.format({
    protocol: "https",
    hostname: `${server}.api.riotgames.com`,
    path
  })

  extractFromUrl(uri, headers, cb)
}

function URLmatchData(matchID) {
  return `/lol/match/v3/matches/${matchID}`
}

function URLrecentGamesData(accountID) {
  return `/lol/match/v3/matchlists/by-account/${accountID}/recent`
}

function URLsummonerID(playerIGN) {
  return `/lol/summoner/v3/summoners/by-name/${playerIGN}`
}

function URLmasteryData(playerID) {
  return `/lol/champion-mastery/v3/champion-masteries/by-summoner/${playerID}/by-champion/112`
}

function URLliveGameData(playerID) {
  return `/lol/spectator/v3/active-games/by-summoner/${playerID}`
}

function playersRanksData(playerID) {
  return `/lol/league/v3/positions/by-summoner/${playerID}`
}

function URLchampionData() {
  return `/lol/static-data/v3/champions?dataById=true`
}

function URLgameTimeline(matchID) {
  return `/lol/match/v3/timelines/by-match/${matchID}`
}

exports.API = function() {
  var api = this
  api.extractGameTimelineData = function(server, matchID, callback) {
    makeRiotRequest(server, URLgameTimeline(matchID), (err, timelineAPI) => {
      if (err) return callback(`:warning: Error retrieving game timeline.`)
      return callback(JSON.parse(timelineAPI))
    })
  }
  api.extractPlayerRanksData = function(server, playerID, callback) {
    makeRiotRequest(server, api.playersRanksData(playerID), (err, ranksAPI) => {
      if (err) return callback(`:warning: Error retrieving ranks data.`)
      return callback(JSON.parse(ranksAPI))
    })
  }
  api.extractMatchData = function(server, matchID, callback) {
    makeRiotRequest(server, URLmatchData(matchID), (err, matchDataAPI) => {
      if (err) return callback(":warning: Error retrieving match data.")
      return callback(JSON.parse(matchDataAPI))
    })
  }
  api.extractRecentGamesData = function(server, accountID, callback) {
    makeRiotRequest(
      server,
      URLrecentGamesData(accountID),
      (err, gameDataAPI) => {
        if (err)
          return callback(":warning: Error retrieving recent games data.")
        return callback(JSON.parse(gamesDataAPI))
      }
    )
  }
  api.extractChampionData = function(server, callback) {
    makeRiotRequest(server, URLchampionData(), (err, championDataAPI) => {
      if (err) return callback(":warning: Error retrieving champion data.")
      return callback(JSON.parse(championDataAPI))
    })
  }
  api.extractPlayersLiveGameData = function(server, playerID, callback) {
    makeRiotRequest(
      server,
      URLliveGameData(playerID),
      (err, liveGameDataAPI) => {
        if (err)
          return callback(
            `:warning: This person either is not in game, or you did something wrong.`
          )
        return callback(JSON.parse(liveGameDataAPI))
      }
    )
  }
  api.extractPlayerID = function(server, playerIGNAndServer, callback) {
    makeRiotRequest(
      server,
      URLsummonerID(playerIGNAndServer[0]),
      (err, playerIDAPI) => {
        if (err)
          return callback(
            `:warning: Player ${decodeURIComponent(
              playerIGNAndServer[0]
            ).toUpperCase()} doesn't exist.`
          )
        return callback(JSON.parse(playerIDAPI).id.toString())
      }
    )
  }
  api.extractPlayerAccountID = function(server, playerIGNAndServer, callback) {
    makeRiotRequest(
      server,
      URLsummonerID(playerIGNAndServer[0]),
      (err, playerIDAPI) => {
        if (err)
          return callback(
            `:warning: Player ${decodeURIComponent(
              playerIGNAndServer[0]
            ).toUpperCase()} doesn't exist.`
          )
        return callback(JSON.parse(playerIDAPI).accountId.toString())
      }
    )
  }
  api.extractPlayerMastery = function(server, playerID, callback) {
    makeRiotRequest(
      server,
      URLmasteryData(playerID),
      (err, championMasteryDataAPI) => {
        if (err)
          return callback(
            `:warning: This person didn't play a single game of me. _Phew_.`
          )

        var mastery = JSON.parse(championMasteryDataAPI)
        var chest = mastery.chestGranted
        var comment = ``

        if (!chest)
          comment = `...how the hell you don't have a chest yet? <:vikwat:269523937669545987>`
        if (mastery.championLevel <= 4)
          comment = `...only level ${
            mastery.championLevel
          }? Come on. You need to step up your game.`
        if (mastery.championPoints >= "500000")
          comment = `Your dedication... is admirable.`
        if (mastery.championPoints >= "1000000")
          comment = `You're amongst the most loyal acolytes. You deserve a cookie. :cookie:`
        if (mastery.championPoints >= "100000" && mastery.championLevel < 6)
          comment = `Over 100k points and yet, still no level 7. _sighs heavily_`

        if (chest == true) chest = ":white_check_mark:"
        else chest = ":negative_squared_cross_mark:"

        return callback(
          `\n**Level**: ${Swap.numberToNumberEmoji(mastery.championLevel)}` +
            `\n**Points**: ${mastery.championPoints}` +
            `\n**Chest**: ${chest}` +
            `\n\n ${comment}`
        )
      }
    )
  }
  api.lastGameSummary = function(matchData, server, callback) {
    var gameSummary = `${matchData.gameMode}${Swap.gameModeIDToName(
      matchData.queueId
    )} [${input.convertMinutesToHoursAndMinutes(matchData.gameDuration)}]`
    var blueTeam = `\`\`.       |    KDA   |  gold |    dmg | lv |\`\`\n\`\`------------------------------------------\`\`\n`
    var redTeam = `\`\`.       |    KDA   |  gold |    dmg | lv |\`\`\n\`\`------------------------------------------\`\`\n`
    api.extractChampionData(server, championDataAPI => {
      if (championDataAPI.toString().startsWith(`:warning:`))
        return callback("error", championDataAPI)
      var champions = championDataAPI
      for (var i = 0; i < matchData.participants.length; i++) {
        var player = matchData.participants[i]
        var kda = `${player.stats.kills}/${player.stats.deaths}/${
          player.stats.assists
        }`
        var level = `${player.stats.champLevel}`
        var gold = `${player.stats.goldEarned}`
        var damage = `${player.stats.totalDamageDealtToChampions}`
        var summonerSpells = `${Swap.spellIDToSpellIcon(
          player.spell1Id
        )}${Swap.spellIDToSpellIcon(player.spell2Id)}`

        var playerNick = api.returnsNickIfRankedGame(matchData, i)

        if (player.teamId == 100) {
          blueTeam +=
            `${summonerSpells} \`\`| ${input.justifyToRight(
              kda,
              8
            )} | ${input.justifyToRight(gold, 5)} | ${input.justifyToRight(
              damage,
              6
            )} | ${input.justifyToRight(level, 2)} ` +
            `| \`\` **${
              champions.data[player.championId].name
            }** ${playerNick} \n`
        } else {
          redTeam +=
            `${summonerSpells} \`\`| ${input.justifyToRight(
              kda,
              8
            )} | ${input.justifyToRight(gold, 5)} | ${input.justifyToRight(
              damage,
              6
            )} | ${input.justifyToRight(level, 2)} ` +
            `| \`\` **${
              champions.data[player.championId].name
            }** ${playerNick} \n`
        }
      }
      return callback(`${gameSummary}`, [
        [api.blueTeamSummary(matchData), blueTeam, false],
        [api.redTeamSummary(matchData), redTeam, false]
      ])
    })
  }
  api.blueTeamSummary = function(matchData) {
    var blueTeamSummary =
      `<:turretblue:316314784532398080>${matchData.teams[0].towerKills} ` +
      `<:inhibblue:316314783924092930> ${matchData.teams[0].inhibitorKills} ` +
      `<:dragonblue:316314783596937218>${matchData.teams[0].dragonKills} ` +
      `<:baronblue:316314783874023434> ${matchData.teams[0].baronKills} ` +
      `<:heraldblue:316314784138002442> ${matchData.teams[0].riftHeraldKills} `
    if (api.whichTeamWon(matchData) == `BLUE`)
      blueTeamSummary += `\`\`.......\`\`:trophy:`
    return blueTeamSummary
  }
  api.redTeamSummary = function(matchData) {
    var redTeamSummary =
      `<:turretred:316314784465420290>${matchData.teams[1].towerKills} ` +
      `<:inhibred:316314784146653185> ${matchData.teams[1].inhibitorKills} ` +
      `<:dragonred:316314783915835393>${matchData.teams[1].dragonKills} ` +
      `<:baronred:316314783634685952> ${matchData.teams[1].baronKills} ` +
      `<:heraldred:316314784209305600> ${matchData.teams[1].riftHeraldKills} `
    if (api.whichTeamWon(matchData) == `RED`)
      redTeamSummary += `\`\`.......\`\`:trophy:`
    return redTeamSummary
  }
  api.returnsNickIfRankedGame = function(matchData, i) {
    try {
      return `- ${matchData.participantIdentities[i].player.summonerName}`
    } catch (err) {
      return ``
    }
  }
  api.whichTeamWon = function(matchData) {
    if (matchData.teams[0].win == `Win`) return `BLUE`
    return `RED`
  }

  api.extractFromUrl = extractFromUrl
}
