exports.Commands = function (answer) {
    var commands = this;

/**
 *  listOfResponses is an object storing commands which can be triggered only with the use of "!", and which either send
 *  a standard string type in return, or execute a function.
 *
 *  Properties are just command keywords.
 *
 *  Values:
 *  @triggers - string response sent by bot when triggered
 *  @typeOfResponse: 'text' (returns string), 'function' (triggers function - sending from inside of function), 'embed' (REQUIRES TITLE!)
 *  @description - description which shows in the list of commands. If UNDEFINED, command doesn't show on the list.
 *  @isModCommand - self-explanatory
 *  @isAvailable - self-explanatory
 *  <@category> - optional for non-mod commands
 *  <@refusal> - a special response which gets sent instead of standard one, if bot decides to refuse to execute the command
 *  <@title> - title for embed messages (required).
 *  <@arguments> - arguments for functions. If function triggers an embed, use this to pass title instead of <title>.
 *  <@postInChannel> - directs the bot's response into the channel which ID is given. If value='DM' will send DM.
*/
    commands.listOfResponses = {
        'h': {
            triggers: `showHelpContents`,
            typeOfResponse: `function`,
            postInChannel: `DM`,
            description: `alternatives: !help/!commands - returns help contents. So basically what you're reading now.`,
            isAvailable: true,
            isModCommand: false
        },
        'help': {
            triggers: `showHelpContents`,
            typeOfResponse: `function`,
            postInChannel: `DM`,
            //description: ``,
            isAvailable: true,
            isModCommand: false
        },
        'commands': {
            triggers: `showHelpContents`,
            typeOfResponse: `function`,
            postInChannel: `DM`,
            //description: ``,
            isAvailable: true,
            isModCommand: false
        },
        'hmod': {
            triggers: `showModCommands`,
            typeOfResponse: `function`,
            postInChannel: `DM`,
            description: `returns the list of moderator exclusive commands`,
            isAvailable: true,
            isModCommand: true
        },
        'iam': {
            triggers: `toIAmCommand`,
            typeOfResponse: `function`,
            description: `adds a role to you (only #bot_commands room)`,
            isAvailable: true,
            isModCommand: false
        },
        'iamnot': {
            triggers: `toIAmNotCommand`,
            typeOfResponse: `function`,
            description: `removes a role from you (only #bot_commands room)`,
            isAvailable: true,
            isModCommand: false
        },
        'roles': {
            triggers: `- servers: BR | EUW | EUNE | NA | JP | CN | SEA | KR | LAN | LAS | OCE | RU | TR | PBE\n` +
            `- are you a Viktor streamer? Type !iam Viktor Streamer\n`,
            title: `Self-assignable roles`,
            typeOfResponse: `embed`,
            description: `shows the list of self-assignable roles`,
            isAvailable: true,
            isModCommand: false
        },
        'membership': {
            triggers: `toMembership`,
            typeOfResponse: `function`,
            description: `shows your loyality to our server`,
            isAvailable: true,
            isModCommand: false
        },
        'topmembers': {
            triggers: `toTopMembers`,
            typeOfResponse: `function`,
            description: `shows the top 10 of the most active users on the server\n`,
            isAvailable: true,
            isModCommand: false
        },
        'redtracker': {
            triggers: 'toRedTracker',
            typeOfResponse: `function`,
            description: `shows all Rioter's comments on boards rearding Viktor (fetched from last 50 Rioter's comments\n`,
            isAvailable: true,
            isModCommand: false
        },
        'beep': {
            triggers: `_sighs deeply_\nBeep. Boop.`,
            typeOfResponse: `text`,
            //description: ``,
            isAvailable: true,
            isModCommand: false
        },
        'build': {
            triggers: 'https://docs.google.com/document/d/1cMamRmGurvKtJPKiEjNmV5LcN-0hh0f6yYYpisHWbgk/edit',
            typeOfResponse: `embed`,
            description: `returns the recommended by /r/ViktorMains build`,
            isAvailable: true,
            isModCommand: false,
            title: `Remmi's Viktor MIDLANE guide with proposed build patches: `
            // arguments: `**♥ GLORIOUS MINIGUIDE TO CLASSIC VIKTOR BUILD ♥**`
        },
        'runes': {
            triggers: `Since we're still pretty early in preseason and rune are still being changed, there's no one main consensus regarding runes now. Check #ask_viktor_main room to ask community members about their preffered choices.`,
            typeOfResponse: `text`,
            description: `returns some info on recommended rune pages`,
            isAvailable: true,
            isModCommand: true,
            arguments: `Viktor runepages!`
        },
        'clubs': {
            triggers: `https://www.reddit.com/r/viktormains/wiki/clubs - the list of NA/EUW/EUNE in-game clubs we know about.`,
            typeOfResponse: `text`,
            description: `returns the list of Viktor clubs known to us`,
            isAvailable: true,
            isModCommand: false
        },
        'faq': {
            triggers: `Useful tips and tricks for new Viktor players: https://www.reddit.com/r/viktormains/wiki/faq`,
            typeOfResponse: `text`,
            description: `returns the link to our FAQ with some usefl stuff for new Viktor players`,
            isAvailable: true,
            isModCommand: false
        },
        'matchup': {
            triggers: `- Remmi's Viktor guide (includes matchups from A to I): https://docs.google.com/document/d/1cMamRmGurvKtJPKiEjNmV5LcN-0hh0f6yYYpisHWbgk/edit\n- subreddit matchup discussions (sorted by new): https://www.reddit.com/r/viktormains/search?q=matchup%20discussion&restrict_sr=1&sort=new\n`,
            typeOfResponse: `embed`,
            description: `links to useful Viktor matchups' resources`,
            isAvailable: true,
            isModCommand: false,
            title: 'Matchup resources for Viktor'
        },
        'dun': {
            triggers: `- OP.gg:\n-- https://na.op.gg/summoner/userName=dun\n-- http://na.op.gg/summoner/userName=cupcakes29\n- Stream:\n-- http://twitch.tv/dunlol`,
            typeOfResponse: `embed`,
            description: `returns some info about Dun, challenger Viktor main`,
            isAvailable: true,
            isModCommand: false,
            title: `Dun, Challenger Viktor main`
        },
        'crown': {
            triggers: `- http://www.op.gg/summoner/userName=ksvmidcrown\n-http://www.op.gg/summoner/userName=%EC%82%BC%EC%84%B1%EA%B0%A4%EB%9F%AD%EC%8B%9C%ED%81%AC%EB%9D%BC%EC%9A%B4\n-http://www.op.gg/summoner/userName=%EA%B3%BC%EC%97%B0%EB%A7%88%EC%A7%80%EB%A7%89%EC%9D%BC%EA%B9%8C`,
            typeOfResponse: `embed`,
            description: `returns some info about Crown, a pro player known from his Viktor play`,
            isAvailable: true,
            isModCommand: false,
            title: `Crown's known accounts`
        },
        'zane': {
            triggers: `- OP.gg:\n-- http://na.op.gg/summoner/userName=zane%20prodigy \n-- http://na.op.gg/summoner/userName=zaun%20holo \n- Stream:\n-- https://www.twitch.tv/zane_prodigy`,
            typeOfResponse: `embed`,
            description: `returns some info about Zane Prodigy, high Diamond Viktor main\n`,
            isAvailable: true,
            isModCommand: false,
            title: `Zane's known accounts`
        },
        'giveid': {
            triggers: `toPlayerIDRequest`,
            typeOfResponse: `function`,
            description: `syntax: !giveid <ign>|<server> - returns the ID of the requested player`,
            isAvailable: true,
            isModCommand: true
        },
        'impersonate': {
            triggers: `toImpersonate`,
            typeOfResponse: `function`,
            description: `sends a given string as Viktor Bot to the #off_topic channel\n`,
            isAvailable: true,
            isModCommand: true
        },
        'joke': {
            triggers: `I won't waste my precious time for the sake of your personal amusement.`,
            typeOfResponse: `text`,
            //description: ``,
            isAvailable: true,
            isModCommand: false
        },
        'locateserver': {
            triggers: `locateServer`,
            typeOfResponse: `function`,
            description: `fetches the server data (chatroom's IDs + server owner ID) into a database. Required for the further moderation`,
            isAvailable: true,
            isModCommand: true
        },
        'mod': {
            triggers: `editModPrivileges`,
            typeOfResponse: `function`,
            arguments: `promote`,
            description: `syntax: !mod @mention - gives bot moderation rights to the user`,
            isAvailable: true,
            isModCommand: true
        },
        'unmod': {
            triggers: `editModPrivileges`,
            typeOfResponse: `function`,
            arguments: `demote`,
            description: `syntax: !unmod @mention - removes bot moderation rights from the user`,
            isAvailable: true,
            isModCommand: true
        },
        'modlist': {
            triggers: `editModPrivileges`,
            typeOfResponse: `function`,
            arguments: `list`,
            description: `shows the list of all users with bot moderation rights\n`,
            isAvailable: true,
            isModCommand: true
        },
        'ban': {
            triggers: `toBan`,
            typeOfResponse: `function`,
            arguments: `ban`,
            description: `syntax: !ban <id>|<reason> - blacklists user, or bans them. Can be used with ID or @mention`,
            isAvailable: true,
            isModCommand: true
        },
        'unban': {
            triggers: `toBan`,
            typeOfResponse: `function`,
            arguments: `unban`,
            description: `syntax: !unban <id> - removes user from the blacklist, or unbans him`,
            isAvailable: true,
            isModCommand: true
        },
        'blacklist': {
            triggers: `toBan`,
            typeOfResponse: `function`,
            arguments: `list`,
            description: `shows the list of blacklised users which will get automatically banned on sight.\n`,
            isAvailable: true,
            isModCommand: true
        },
        'antispam': {
            triggers: `toAntiSpam`,
            typeOfResponse: `function`,
            description: `turns antispam on or off. Settings: !antispam <number_of_messages>|<time_limit>\n`,
            isAvailable: true,
            isModCommand: true
        },
        'setstatus': {
            triggers: `toStatusChangeRequest`,
            typeOfResponse: `function`,
            description: `changes the status of Viktor Bot to given one`,
            isAvailable: true,
            isModCommand: true
        },
        'test': {
            triggers: answer.toTest,
            typeOfResponse: `text`,
            description: `testing function`,
            isAvailable: true,
            isModCommand: true
        },
        'version': {
            triggers: answer.toVersion,
            typeOfResponse: `text`,
            //description: ``,
            isAvailable: true,
            isModCommand: false
        },
        'ingame': {
            triggers: `toLiveGameRequest`,
            arguments: `:game_die:`,
            typeOfResponse: `function`,
            description: `syntax: !ingame <ign>|<server> - shows info of an ongoing League game`,
            isAvailable: true,
            isModCommand: false
        },
        'lastgame': {
            triggers: `toLastGameRequest`,
            typeOfResponse: `function`,
            description: `syntax: !lastgame <ign>|<server> - shows info of last game of a particular player`,
            isAvailable: true,
            isModCommand: false
        },
        // 'lastlane': {
        //     triggers: `toLastLaneRequest`,
        //     typeOfResponse: `function`,
        //     description: `syntax: !lastlane <ign>|<server> - shows info of laning phase from the last game of a particular player`,
        //     isAvailable: true,
        //     isModCommand: false
        // },
        'mastery': {
            triggers: `toViktorMastery`,
            arguments: `<:viktorgod:269479031009837056> Viktor mastery points for`,
            typeOfResponse: `function`,
            description: `syntax: !mastery <ign>|<server> - returns Viktor mastery for the particular player`,
            isAvailable: true,
            isModCommand: false
        },
        'opgg': {
            triggers: `toOPGG`,
            typeOfResponse: `function`,
            description: `syntax: !opgg <ign>|<server> returns link to player's op.gg`,
            isAvailable: true,
            isModCommand: false,
            refusal: `I don't think you want to show _that_  to everyone.`
        },
        'pbe': {
            triggers: `toPBE`,
            typeOfResponse: `function`,
            description: `returns link to thenewest PBE patch\n`,
            isAvailable: true,
            isModCommand: false
        }, 
        'challengerrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            description: `Challenger Race!`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Challenger+Master+Diamond`
        },
        'masterrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            description: `Master Race!`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Master+Diamond+Platinum`
        },
        'diamondrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            description: `Diamond Race!`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Diamond+Platinum+Gold`
        },
        'platinumrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            description: `Platinum Race!`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Platinum+Gold+Silver`
        },
        'goldrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            description: `Gold Race!`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Gold+Silver+Bronze`
        },
        'silverrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            description: `Silver Race!\n`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Silver+Bronze+Iron`
        },
        'bronzerace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            description: `Bronze Race!\n`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Bronze+Iron+Unranked`
        },
        'streamers': {
            triggers: `toStreamerList`,
            typeOfResponse: `function`,
            description: `shows the list of Viktor Streamers on our Discord server and their IDs`,
            isAvailable: true,
            isModCommand: false
        },
        'follow': {
            triggers: `toFollow`,
            typeOfResponse: `function`,
            arguments: `start`,
            description: `syntax: !follow <id> - allows you to follow the chosen streamer, <id> being taken from !streamers command`,
            isAvailable: true,
            isModCommand: false
        },
        'unfollow': {
            triggers: `toFollow`,
            typeOfResponse: `function`,
            arguments: `stop`,
            description: `syntax: !unfollow <id> - allows you to unfollow a streamer`,
            isAvailable: true,
            isModCommand: false
        },
        'myfollowers': {
            triggers: `toFollow`,
            typeOfResponse: `function`,
            arguments: `listOfMyFollowers`,
            description: `shows the list of people following your stream`,
            isAvailable: true,
            isModCommand: false
        },
        'whoifollow': {
            triggers: `toFollow`,
            typeOfResponse: `function`,
            arguments: `listOfWhoIFollow`,
            description: `shows the list of streamers followed by you\n`,
            isAvailable: true,
            isModCommand: false
        },
        'comics': {
            triggers: `toComics`,
            typeOfResponse: `function`,
            description: `returns the list of Viktor-themed comics`,
            isAvailable: true,
            isModCommand: false
        },
        'choose': {
            triggers: `toChoose`,
            typeOfResponse: `function`,
            description: `syntax: !choose 1|2|...|n - chooses one from given choices`,
            isAvailable: true,
            isModCommand: false
        },
        'meow': {
            triggers: `toCatPicture`,
            typeOfResponse: `function`,
            description: `returns random cat photo 🐈`,
            isAvailable: true,
            isModCommand: false,
            refusal: `You have been given an opportunity to ask me, an evolved being, for anything; and you ask for a cat photo. _Really?_\n`
        },
        'woof': {
            triggers: `toDogPicture`,
            typeOfResponse: `function`,
            description: `returns random dog photo 🐕`,
            isAvailable: true,
            isModCommand: false,
            refusal: `You have been given an opportunity to ask me, an evolved being, for anything; and you ask for a puppy photo. _Really?_\n`
        },
        'rito': {
            triggers: `:white_sun_small_cloud:\n\n` +
            `       <:rito:323416307414335488>\n` +
            `          |:open_hands:\n` +
            `         / _\n` +
            `━━━━━┓ ＼＼ \n` +
            `┓┓┓┓┓┃\n` +
            `┓┓┓┓┓┃ ヽ<:viktor:232941841815830536>ノ\n` +
            `┓┓┓┓┓┃      /\n` +
            `┓┓┓┓┓┃  ノ) \n` +
            `┓┓┓┓┓┃\n` +
            `┓┓┓┓┓┃\n`,
            typeOfResponse: `text`,
            description: `>:3`,
            isAvailable: true,
            isModCommand: false
        },
        'gibeskin': {
            triggers: `http://arcyvilk.com/greatherald/img/gibeskin.png`,
            typeOfResponse: `text`,
            description: `[legacy] calculates time since we've got the last Viktor skin\n`,
            isAvailable: true,
            isModCommand: false
        }
    };
/**
 *  listOfKeywords is an object storing keywords, which when found laying around inside sentences sent by users, are responded with
 *  whatever is inside (maintains both strings (standard) and functions (via catch - currently in the process of changing it for the
 *  typeOfResponse trigger rather).
 *  
 *  Properties are keywords which trigger specific responses. If you put "+" in property, all the words have to be present in the sentence for the
 *  trigger to be... well... triggered. Keywords aren't trimmed so you can use whitespaces to manipulate results (for example to differentiate
 *  vik in Viktor and in Rejkiavik).
 *
 *  Values:
 *  @triggers - response sent by bot when triggered
 *  @chanceOfTriggering - % chance of the response getting trigered
 *  @typeOfResponse: 'text' (when jus returns string) or 'function' (when it returns a function's result),
*/
    commands.listOfKeywords = {
        'hello': {
            triggers: `Greetings, inferior construct!`,
            typeOfResponse: `text`,
            chanceOfTriggering: 20
        },
        'shrug': {
            triggers: `¯\\\\_ <:viktor:232941841815830536> \\_/¯`,
            typeOfResponse: `text`,
            chanceOfTriggering: 70
        },
        'build+ vik': {
            triggers: `toBuildTrigger`,
            typeOfResponse: `function`,
            chanceOfTriggering: 100
        },
        ' club+ vik': {
            triggers: `https://www.reddit.com/r/viktormains/wiki/clubs - the list of NA/EUW/EUNE in-game clubs we know about.`,
            typeOfResponse: `text`,
            chanceOfTriggering: 100
        }
    };
/**
 *  listOfEmoteReactionResponses is an object storing keywords, which when triggered make bot respond with an emoji.
 *  Properties are keywords which trigger specific responses. 
 *
 *  Values:
 *  @emoteResponse - either Unicode emoji or ID emoji which will be sent as bot's reaction
 *  @chanceOfTriggering - % chance of the reaction getting trigered
*/
    commands.listOfEmoteReactionResponses = {
        ':questionmark:': {
            emoteResponse: `:questionmark:244535324737273857`,
            chanceOfTriggering: 100
        },
        'smh': {
            emoteResponse: `:vikfacepalm:305783369302802434`,
            chanceOfTriggering: 20
        },
        ' cat ': {
            emoteResponse: `🐱`,
            chanceOfTriggering: 2
        }
    };
};