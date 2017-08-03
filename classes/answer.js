var Commands = require('./commands.js');
var RNG = require('./rng.js');
var Input = require('./input.js');
var DearViktorAnswers = require('./dearviktoranswers.js');
var Matchup = require('./matchup.js');
var Roles = require('./roles.js');
var Race = require('./race.js');
var Post = require('./post.js');
var Swap = require('./swap.js');
var API = require('./API.js');

exports.Answer = function (data) {
    var answer = this;
    var rng = new RNG.RNG();
    var input = new Input.Input();
    var post = new Post.Post(data);
    var swap = new Swap.Swap();

    answer.userMessage = data.message;

    answer.toBuild = function (title) {
        var build = [];
       
        build[0] = [`First Back Purchases`,
            `**< 1250 gold:** <:darkseal:315619117103316992> + <:refillable:315619119007531028> / <:doran:315619117287735306> + <:refillable:315619119007531028>\n` +
            `**To Lich Bane Build:** <:hc1:315619117346586625> + <:refillable:315619119007531028>\n` +            
            `**To Morello Build:** <:lostchapter:320701853681713153> + <:refillable:315619119007531028>`, false];
        build[1] = [`Morello's Tornment Build For Relevant Midgame`, `<:lostchapter:320701853681713153> → <:hc1:315619117346586625> → <:boot_sorcs:315619116641812481> → ` +
            `<:morello:315619118264877057> → <:hc3:315619117782532098> → <:liandry:315636873647357952> → <:voidstaff:315619119376367635> → ` +
            `<:zhonya:315619119544401920>/<:rabadon:315619119019982848>` +
            `\n\n**Important:** DFT mastery is necessary for this build.`+
            `\n\n**Pros:** \n• relevant early- and midgame \n• allows you to trade aggressively in lane \n• you stay relevant even when forced out of lane before 1250 gold ` +
            `\n• gives you early skirmishing power \n• allows you to delete a squishy in late game with only ER(R) `+
            `\n**Cons:** \n• unable to shove in early game \n• lower late game DPS than with Lich Bane build \n• less effective vs tanks`, false];
        build[2] = [`Classic Lich Bane Build`, `<:hc1:315619117346586625> → <:sheen:315619119133360128>/<:hc2:315619117958692864> → ` +
            `<:lichbane:315619118340505601>/<:hc3:315619117782532098> → <:boot_ion:315619116557795338> → <:rabadon:315619119019982848>/<:voidstaff:315619119376367635> →` +
            `<:zhonya:315619119544401920>/<:banshee:315619116365119489>` +
            `\n\n**Pros:** \n• very high DPS \n• godlike late game with a potential to oneshot a squishy every ~3 seconds \n• makes Viktor a great tank killer` +
            `\n**Cons:** \n• __very__ weak early- and midgame \n• worthless in early skirmishes \n• need to remain in autoattack range for full effectiveness`, false];
        /*build[3] = [`Banshee Rush Build`, `<:hc1:315619117346586625> → <:banshee:315619116365119489> → <:boot_ion:315619116557795338> → <:hc3:315619117782532098> → ` +
            `<:lichbane:315619118340505601> → <:rabadon:315619119019982848>/<:voidstaff:315619119376367635> → <:rabadon:315619119019982848>/<:voidstaff:315619119376367635>` +
            `\n\nBuild versus high AP damage threats, where MR is crucial (**LeBlanc**, **Fizz**, **Syndra**); versus **Ahri** to nullify her Charm; ` +
            `versus **Kassadin** as his base damage is very low; versus **Cassiopeia** as she is unable to counter early MR with <:boot_sorcs:315619116641812481>`, false];*/
        
        post.embedToDM(title, build, data.message.author);
    }
    answer.showHelpContents = function () {
        var Commands = require('./commands.js');
        var commands = new Commands.Commands('');
        var Input = require('./input.js');
        var input = new Input.Input();
        var helpContents = '```List of commands:\n\n';

        for (var property in commands.listOfResponses) {
            if (!commands.listOfResponses[property].isModCommand && commands.listOfResponses[property].hasOwnProperty('description')) {
                var commandDescription = `!${input.justifyToLeft(property, 15)} - ${commands.listOfResponses[property].description}\n`;
                if (helpContents.length + commandDescription.length >= 2000) {
                    post.toDM(helpContents + '```');
                    helpContents = '```';
                }
                helpContents += commandDescription;
            }
        };
        helpContents += '```';
        post.toDM(helpContents);
    };

    answer.toVersion = data.version;
    answer.toTest = `>:3`;
    answer.notImplemented = `Not implemented yet.`;


    answer.userIsAMod = function () {
        for (i in data.arrayOfMods) {
            if (data.arrayOfMods[i] == data.message.author.id)
                return true;
        }
        return false;
    };
    answer.userAllowedToUseCommand = function (cmd) {
        if (cmd.isModCommand && !answer.userIsAMod())
            return false;
        return true;
    };
    answer.commandIsAvailable = function (cmd) {
        if (cmd.isAvailable)
            return true;
        return false;
    };


    answer.toCapsLock = function () {
        if (rng.happensWithAChanceOf(7))
            return post.reactionToMessage(`:ahaok:288392049873518602`);
        if (rng.happensWithAChanceOf(14))
            return post.reactionToMessage(`:qqsob:292446164622770187`);
        if (rng.happensWithAChanceOf(40))
            return post.reactionToMessage(`🍿`);
    };
    answer.toCommand = function () {
        var keyword = input.extractKeyword(data.message.content);
        var commands = new Commands.Commands(answer);

        if (commands.listOfResponses.hasOwnProperty(keyword))
            answer.checkForModPrivileges(commands.listOfResponses[keyword]);
    };
    answer.toDearViktor = function () {
        var dearviktor = new DearViktorAnswers.DearViktorAnswers();
        if (!answer.userMessage.content.endsWith(`?`))
            return post.message(`_That_ doesn't look like question to me.`);
        if (dearviktor.arcyHappened(answer.userMessage.content))
            return post.message(dearviktor.arcyAnswers[rng.chooseRandom(dearviktor.arcyAnswers.length)]);
        return post.message(dearviktor.list[rng.chooseRandom(dearviktor.list.length)]);
    };
    answer.toEmoteReactionTrigger = function () {
        var commands = new Commands.Commands(answer);
        for (property in commands.listOfEmoteReactionResponses) {
            var cmd = commands.listOfEmoteReactionResponses[property];
            if (!input.allKeywordsWereFoundInString(property.toString().split('+'), data.message.content))
                continue;
            if (rng.happensWithAChanceOf(cmd.chanceOfTriggering))
                return post.reactionToMessage(commands.listOfEmoteReactionResponses[property].emoteResponse);
        }
    };
    answer.toKeyword = function () {
        var commands = new Commands.Commands(answer);
        for (property in commands.listOfKeywords) {
            var cmd = commands.listOfKeywords[property];
            if (!input.allKeywordsWereFoundInString(property.toString().split('+'), data.message.content))
                continue;
            if (rng.happensWithAChanceOf(cmd.chanceOfTriggering))
                return answer.sendAppropiateResponseToCommand(cmd);
        }
    };



    answer.checkForModPrivileges = function (cmd) {
        if (!answer.userAllowedToUseCommand(cmd))
            return post.toDM("```You aren\'t allowed to use this command because you ain\'t cool enough.```");
        if (!answer.commandIsAvailable(cmd))
            return post.message("```This command is temporarily unavailable. " +
                "It will get turned on again after the application proces for Viktor Bot gets completed. " +
                "Sorry for inconvenience and please be patient.```");
        answer.checkForBotRefusal(cmd);
    };
    answer.checkForBotRefusal = function (cmd) {
        if (rng.botRefuses()) {
            if (cmd.refusal)
                return post.message(cmd.refusal);
            return post.message(`I refuse to execute your petty command.`);
        }
        return answer.sendAppropiateResponseToCommand(cmd);
    };
    answer.sendAppropiateResponseToCommand = function (cmd) {
        if (cmd.typeOfResponse == `text`) {
            if (!cmd.hasOwnProperty(`postInChannel`))
                return post.message(cmd.triggers);
            if (cmd.postInChannel == `DM`)
                return post.toDM(cmd.triggers);
            return post.messageToChannel(cmd.triggers, cmd.postInChannel);
        }
        if (cmd.typeOfResponse == `embed`) {
            if (!cmd.hasOwnProperty(`postInChannel`))
                return post.embed(cmd.title, [[`___`, cmd.triggers, false]]);
            return post.messageToChannel(cmd.title, [[`___`, cmd.triggers, false]], cmd.postInChannel);
        }
        if (cmd.typeOfResponse == `function`) {
            answer[cmd.triggers](cmd.arguments);
        }
    };
    

    answer.toBan = function (typeOfRequest) {
        var Ban = require('./mod/ban.js');
        var ban = new Ban.Ban(data);

        if (typeOfRequest == `ban`)
            return ban.ban();
        if (typeOfRequest == `unban`)
            return ban.unban();
        if (typeOfRequest == `list`)
            return ban.banList();
    };
    answer.showModCommands = function () {
        var Mods = require('./mod/mods.js');
        var mods = new Mods.Mods(data);

        return mods.showModCommands();
    };
    answer.locateServer = function () {
        var Mods = require('./mod/mods.js');
        var mods = new Mods.Mods(data);

        return mods.locateServer();
    };
    answer.editModPrivileges = function (typeOfRequest) {
        var Mods = require('./mod/mods.js');
        var mods = new Mods.Mods(data);

        if (typeOfRequest == `promote`)
            return mods.promote();
        if (typeOfRequest == `demote`)
            return mods.demote();
        if (typeOfRequest == `list`)
            return mods.showList();
    };


    answer.toMembership = function () {
        var MessageCount = require('./mod/messageCount.js');
        var mc = new MessageCount.MessageCount(data);
        mc.toMembership();
    };
    answer.toAntiSpam = function () {
        var Mods = require('./mod/mods.js');
        var mods = new Mods.Mods(data);
        
        if (input.removeKeyword(data.message.content) == ``)
            return mods.turnAntiSpamOnOrOff();
        return mods.setUpAntiSpam();
    };
    answer.toStreamerList = function () {
        var Follow = require('./data/follow.js');
        var follow = new Follow.Follow(data);

        return follow.listOfStreamers();
    };
    answer.toFollow = function (typeOfRequest) {
        var Follow = require('./data/follow.js');
        var follow = new Follow.Follow(data);

        if (typeOfRequest == `start`)
            return follow.start();
        if (typeOfRequest == `stop`)
            return follow.stop();
        if (typeOfRequest == `listOfMyFollowers`)
            return follow.listOfMyFollowers();
        if (typeOfRequest == `listOfWhoIFollow`)
            return follow.listOfWhoIFollow();
    };
    answer.toImpersonate = function () {
        var impersonate = input.removeKeyword(data.message.content);
        post.messageToChannel(impersonate, data.offTop);
    };
    answer.toSkinTimer = function () {
        var dateCreator = Date.UTC(2013, 9, 1);
        var datePromised = Date.UTC(2018, 2, 5);
        var dateNow = new Date(); 
        dateNow = Date.now();

        var creatorMath = `Creator skin got released at 1st of October, 2013. That gives us ` +
            `**${input.round((dateNow - dateCreator) / 1000, 0)}** seconds, or ` +
            `**${input.round((dateNow - dateCreator) / 60000, 0)}** minutes, or ` +
            `**${input.round((dateNow - dateCreator) / 3600000, 0)}** hours, or ` +
            `**${input.round((dateNow - dateCreator) / 86400000, 0)}** days since the last Viktor skin.`
        var newSkinMath = `However, we've been promised at 5th of March, 2017 that we will get a skin in the next 12 months. ` +
            `That means, that if it doesn't happen in the next `+
            `**${input.round((datePromised - dateNow) / 1000, 0)}** seconds, or ` +
            `**${input.round((datePromised - dateNow) / 60000, 0)}** minutes, or ` +
            `**${input.round((datePromised - dateNow) / 3600000, 0)}** hours, or ` +
            `**${input.round((datePromised - dateNow) / 86400000, 0)}** days, then we can start dedusting our pitchforks. ---E`

        post.embed(`:timer: Viktor skin`, [[`______`, `${creatorMath}\n\n${newSkinMath}`, false]]);
    };
    answer.toRace = function (fetchedRanks) {
        var race = new Race.Race(data, post);
        var rankDesiredCurrentAndLower = fetchedRanks.split(`+`);

        if (input.removeKeyword(data.message.content).startsWith(`add`)) {
            if (input.removeKeyword(data.message.content).indexOf(`<`) !== -1) {
                return post.message(`**<** and **>** is supposed to indicate that this is a part where you put your IGN and server. You don't _literally_  ` +
                    `put **<** and **>** there. <:vikfacepalm:305783369302802434>`);
            }
            return race.join(rankDesiredCurrentAndLower);
        }
        return race.leaderboards(rankDesiredCurrentAndLower[0], rankDesiredCurrentAndLower[1], rankDesiredCurrentAndLower[2]);
    };
    answer.toPBE = function () {
        var api = new API.API();

        api.extractFromURL(`http://www.surrenderat20.net/search/label/PBE/`, surrAt20API => {
            if (!api.everythingOkay(surrAt20API))
                return post.message(`Unable to fetch the newest PBE patch notes.`);
            var findThis = `<h1 class='news-title' itemprop='name'>`;
            surrAt20API = surrAt20API.toString();
            try {
                surrAt20API = surrAt20API.substring(surrAt20API.indexOf(findThis) + findThis.length);
                surrAt20API = surrAt20API.substring(surrAt20API.indexOf(`<a href='`) + 9, surrAt20API.indexOf(`'>`));

                api.extractFromURL(surrAt20API, currentPatchHTML => {
                    if (!api.everythingOkay(currentPatchHTML))
                        return post.message(`Unable to fetch the newest PBE patch notes.`);
                    var newestPBEPatchVersion = currentPatchHTML.toString();
                    try {
                        newestPBEPatchVersion = newestPBEPatchVersion.substring(newestPBEPatchVersion.indexOf(`reddit_title = "`) + 16);
                        newestPBEPatchVersion = newestPBEPatchVersion.substring(0, newestPBEPatchVersion.indexOf(`";`));
                        return post.embed(``, [[newestPBEPatchVersion, surrAt20API, false], [`Full PBE coverage`, `http://www.surrenderat20.net/p/current-pbe-balance-changes.html`, false]]);
                    }
                    catch (err) {
                        return post.message(`Unable to fetch the newest PBE patch notes. ${err}`);
                    };
                });
            }
            catch (err) {
                return post.message(`Unable to fetch the newest PBE patch notes. ${err}`);
            };
        });
    };
    answer.toLastGameRequest = function () {
        post.message(`:hourglass_flowing_sand: Getting the Last Game data. This might take a while...`);

        var _input = data.message.content;
        if (!input.hasSeparator(_input))
            return post.message(`This command requires the symbol \"**|**\" to separate region from nickname. \n_Example:_ \`\`!lastgame ${data.message.author.username}**|**euw\`\``);

        var api = new API.API();
        var playerIGNAndServer = input.returnModifiedIGNAndServer(_input);
        var playerNickDecoded = input.readdSpecialSymbols(playerIGNAndServer[0]).toUpperCase();
        var server = swap.serverToEndPoint(playerIGNAndServer[1]); //TODO: this is what every Rito API command looks like - unifize it somehow

        api.extractPlayerAccountID(server, playerIGNAndServer, accountID => {
            if (accountID.toString().startsWith(`:warning:`))
                return post.message(accountID);
            api.extractRecentGamesData(server, accountID, recentGamesData => {
                if (recentGamesData.toString().startsWith(`:warning:`))
                    return post.message(recentGamesData);
                var matchID = recentGamesData.matches[0].gameId;
                api.extractMatchData(server, matchID, matchData => {
                    if (matchData.toString().startsWith(`:warning:`))
                        return post.message(matchData);
                    api.lastGameSummary(matchData, server, (title, gameSummary) => {
                        if (gameSummary.toString().startsWith(`:warning:`))
                            return post.message(gameSummary);
                        return post.embed(title,
                            [[gameSummary[0][0], gameSummary[0][1], gameSummary[0][2]],
                            [gameSummary[1][0], gameSummary[1][1], gameSummary[1][2]]]);
                    });
                });
            });
        });
    }; 
    answer.toLiveGameRequest = function (title) { //full rework!!!!!
        post.message(`:hourglass_flowing_sand: Getting the Live Game data. This might take a while...`);
        var _input = data.message.content;
        if (!input.hasSeparator(_input))
            return post.message(`This command requires the symbol \"**|**\" to separate region from nickname. \n_Example:_ \`\`!giveid ${data.message.author.username}**|**euw\`\``);

        var api = new API.API();
        var playerIGNAndServer = input.returnModifiedIGNAndServer(_input);
        var playerNickDecoded = input.readdSpecialSymbols(playerIGNAndServer[0]).toUpperCase();
        var server = swap.serverToEndPoint(playerIGNAndServer[1]); //TODO: this is what every Rito API command looks like - unifize it somehow

        api.extractPlayerID(server, playerIGNAndServer, playerID => {
            if (playerID.toString().startsWith(`:warning:`))
                return post.message(playerID);
            api.extractPlayersLiveGameData(server, playerID, liveGameDataAPI => {
                if (liveGameDataAPI.toString().startsWith(`:warning:`))
                    return post.message(liveGameDataAPI);
                var game = liveGameDataAPI;
                api.extractChampionData(server, championDataAPI => {
                    if (championDataAPI.toString().startsWith(`:warning:`))
                        return post.message(championDataAPI);
                    var ids = "";
                    for (var i = 0; i < game.participants.length; i++)
                        ids += "," + game.participants[i].summonerId;
                    //api.extractPlayerRanksData(swap.endPointToServer(server), ids.slice(1), ranksData => {
                    //    if (ranksData.toString().startsWith(`:warning:`))
                    //        return post.message(ranksData);
                        var champions = championDataAPI;
                        //var ranks = ranksData;
                        var ranks = undefined;

                        var blueTeam = ``;
                        var redTeam = ``;

                        for (var i = 0; i <= game.participants.length; i++) {
                            if (i == game.participants.length) {
                                post.embed(`${title} Live game of ${playerNickDecoded.toUpperCase()} | ${game.gameMode} ${swap.gameModeIDToName(game.gameQueueConfigId)}`,
                                    [[`:large_blue_circle: Blue Team`, blueTeam, true],
                                    [`:red_circle: Red Team`, redTeam, true],[`___`,`:warning: Ranks and win ratio are temporarily unavailable.`,false]]);
                                break;
                            }
                            var player = ``;

                            var rank = `--`;
                            var wins = 0;
                            var losses = 0;
                            var winRatio = `---`;
                            var summonerSpells = swap.spellIDToSpellIcon(game.participants[i].spell1Id)+swap.spellIDToSpellIcon(game.participants[i].spell2Id);
                            /*if (ranks[game.participants[i].summonerId] != undefined) {
                                rank = ranks[game.participants[i].summonerId][0].tier.substring(0, 1) + swap.romanToArabic(ranks[game.participants[i].summonerId][0].entries[0].division);

                                wins = ranks[game.participants[i].summonerId][0].entries[0].wins;
                                losses = ranks[game.participants[i].summonerId][0].entries[0].losses;
                                winRatio = input.round(wins / (wins + losses) * 100, 0);
                            }
                            if (winRatio !== `---`) {
                                if (winRatio < 10)
                                    winRatio += `% `;
                                else winRatio += `%`;
                            }*/
                            player += `\`\`|${rank}|`;

                            var nick = game.participants[i].summonerName.trim().replace(/ /g, "");
                            var championAndNick = `**${champions.data[game.participants[i].championId].name}** | ${nick}`;
                            //if (championAndNick.length > 22)
                            //    championAndNick = championAndNick.substring(0,22)+`...`;
                            if (nick.toLowerCase().trim() == playerNickDecoded.toLowerCase().trim())
                                player += `${winRatio}|\`\`${summonerSpells} __${championAndNick}__`;
                            else player += `${winRatio}|\`\`${summonerSpells} ${championAndNick}`;

                            if (game.participants[i].teamId % 200 != 0)//blue
                                blueTeam += `${player}\n`;
                            else redTeam += `${player}\n`;
                        };
                    //});
                });
            });
        });
    };
    answer.toPlayerIDRequest = function () {
        var _input = data.message.content;
        if (!input.hasSeparator(_input))
            return post.message(`This command requires the symbol \"**|**\" to separate region from nickname. \n_Example:_ \`\`!giveid ${data.message.author.username}**|**euw\`\``);

        var api = new API.API();
        var playerIGNAndServer = input.returnModifiedIGNAndServer(_input);
        var playerNickDecoded = input.readdSpecialSymbols(playerIGNAndServer[0]).toUpperCase();
        var server = swap.serverToEndPoint(playerIGNAndServer[1]); //TODO: this is what every Rito API command looks like - unifize it somehow

        api.extractPlayerID(server, playerIGNAndServer, playerID => {
            if (playerID.toString().startsWith(`:warning:`))
                return post.message(playerID);
            post.message(`${playerNickDecoded} - ${playerID}`);
        });
    }
    answer.toViktorMastery = function (title) {
        var _input = data.message.content;
        if (!input.hasSeparator(_input))
            return post.message(`This command requires the symbol \"**|**\" to separate region from nickname. \n_Example:_ \`\`!mastery ${data.message.author.username}**|**euw\`\``);
        var api = new API.API();
        var playerIGNAndServer = input.returnModifiedIGNAndServer(_input);
        var playerNickDecoded = input.readdSpecialSymbols(playerIGNAndServer[0]);
        var server = swap.serverToEndPoint(playerIGNAndServer[1]); //TODO: this is what every Rito API command looks like - unifize it somehow
        
        api.extractPlayerID(server, playerIGNAndServer, playerID => {
            if (playerID.startsWith(`:warning:`))
                return post.message(playerID);
            api.extractPlayerMastery(server, playerID, masterySummary => {
                post.embed(`${title} ${playerNickDecoded.toUpperCase()}`, [[`___`, `${masterySummary}`, false]]);
            });
        });
    };
    answer.toStatusChangeRequest = function () {
        var newStatus = input.removeKeyword(data.message.content);
        post.newStatus(newStatus);
    };
    answer.toCatPicture = function () {
        var api = new API.API();
        api.extractFromURL('http://random.cat/meow', extractedStuff => {
            if (!api.everythingOkay(extractedStuff))
                return post.message('Unable to get a cat.');
            var cat = JSON.parse(extractedStuff).file;
            post.message(`${cat} 🐱 :3`);
        });
    };
    answer.toDogPicture = function () {
        var api = new API.API();
        api.extractFromURL('http://random.dog/woof', extractedStuff => {
            if (!api.everythingOkay(extractedStuff))
                return post.message('Unable to get a dog.');
            post.message(`http://random.dog/${extractedStuff} 🐶 :3`);
        });
    };
    answer.toChoose = function () {
        var thingsToChooseFrom = input.removeKeyword(data.message.content);
        if (!input.hasSeparator(thingsToChooseFrom))
            return post.message("Incorrect format of input.");
        thingsToChooseFrom = thingsToChooseFrom.split('|');
        post.message(`You should ${thingsToChooseFrom[rng.chooseRandom(thingsToChooseFrom.length)]}.`);
    };
    answer.toOPGG = function () {
        var _input = data.message.content;
        if (!input.hasSeparator(_input))
            return post.message(`This command requires the symbol \"**|**\" to separate region from nickname. \n_Example:_ !opgg ${data.message.author.username}**|**euw`);
        var playerData = input.returnModifiedIGNAndServer(_input);
        post.message("https://" + playerData[1] + ".op.gg/summoner/userName=" + playerData[0]);
    };
    answer.toMatchup = function () {
        var matchup = new Matchup.Matchup();
        var championName = input.removeKeyword(data.message.content).toLowerCase();
        for (property in matchup.listOfChampions){
            if (championName === property)
                return post.message(matchup.listOfChampions[property]);
        }
        return post.message(`Code name [${championName.toUpperCase()}]: missing data. This matchup hasn\'t been discussed yet, it seems.`);
    };
    answer.toIAmCommand = function () {
        var roles = new Roles.Roles(answer.userMessage.member);
        roles.requestedManually = true;
        roles.getData(data);

        var desiredRole = input.removeKeyword(answer.userMessage.content);
        return roles.addRoleToUser(desiredRole);
    };
    answer.toIAmNotCommand = function () {
        var roles = new Roles.Roles(answer.userMessage.member);
        roles.requestedManually = true;
        roles.getData(data);

        var removedRole = input.removeKeyword(answer.userMessage.content);
        return roles.removeRoleFromUser(removedRole);
    };
};
