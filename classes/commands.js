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
            triggers: `- servers: BR | EUW | EUNE | NA | JP | CN | SEA | KR | LAN | LAS | OCE | RU | TR\n` +
            `- are you a Viktor streamer? Type !iam Viktor Streamer\n`,
            title: `Self-assignable roles`,
            typeOfResponse: `embed`,
            description: `shows the list of self-assignable roles\n`,
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
            triggers: 'toBuild',
            typeOfResponse: `function`,
            description: `returns the recommended by /r/ViktorMains build`,
            isAvailable: true,
            isModCommand: false,
            arguments: `**♥ GLORIOUS MINIGUIDE TO BUILD ♥**`
        },
        'clubs': {
            triggers: `https://www.reddit.com/r/viktormains/wiki/clubs - the list of NA/EUW/EUNE in-game clubs we know about.`,
            typeOfResponse: `text`,
            description: `returns the list of Viktor clubs known to us`,
            isAvailable: true,
            isModCommand: false
        },
        'dun': {
            triggers: `- OP.gg - https://na.op.gg/summoner/userName=duniswashedup\n- Stream - http://twitch.tv/dunlol`,
            typeOfResponse: `embed`,
            description: `returns someinfo about Dun, challenger Viktor main`,
            isAvailable: true,
            isModCommand: false,
            title: `Dun, Challenger Viktor main`
        },
        'faq': {
            triggers: `Useful tips and tricks for new Viktor players: https://www.reddit.com/r/viktormains/wiki/faq`,
            typeOfResponse: `text`,
            description: `returns the link to our FAQ with some usefl stuff for new Viktor players`,
            isAvailable: true,
            isModCommand: false
        },
        'matchup': {
            triggers: `toMatchup`,
            typeOfResponse: `function`,
            description: `syntax: !matchup <championname> - returns link to the Viktor vs <Champion> matchup tips\n`,
            isAvailable: true,
            isModCommand: false
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
            isAvailable: false,
            isModCommand: false
        },
        'lastgame': {
            triggers: `toLastGameRequest`,
            typeOfResponse: `function`,
            description: `syntax: !lastgame <ign>|<server> - shows info of last game of a particular player`,
            isAvailable: false,
            isModCommand: false
        },
        'mastery': {
            triggers: `toViktorMastery`,
            arguments: `<:viktorgod:269479031009837056> Viktor mastery points for`,
            typeOfResponse: `function`,
            description: `syntax: !mastery <ign>|<server> - returns Viktor mastery for the particular player`,
            isAvailable: false,
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
            arguments: `Silver+Bronze+Unranked`
        },
        'streamers': {
            triggers: `toStreamerList`,
            typeOfResponse: `function`,
            description: `syntax: !follow @mention - sends a message whenever followed person starts streaming`,
            isAvailable: true,
            isModCommand: true
        },
        'follow': {
            triggers: `toFollow`,
            typeOfResponse: `function`,
            arguments: `start`,
            description: `syntax: !follow @mention - tags you in #live_stream room whenever followed person starts streaming`,
            isAvailable: true,
            isModCommand: false
        },
        'unfollow': {
            triggers: `toFollow`,
            typeOfResponse: `function`,
            arguments: `stop`,
            description: `syntax: !unfollow @mention - opts out of the function described above`,
            isAvailable: true,
            isModCommand: false
        },
        'myfollowers': {
            triggers: `toFollow`,
            typeOfResponse: `function`,
            arguments: `listOfMyFollowers`,
            description: `lists all users following your stream`,
            isAvailable: true,
            isModCommand: false
        },
        'whoifollow': {
            triggers: `toFollow`,
            typeOfResponse: `function`,
            arguments: `listOfWhoIFollow`,
            description: `lists all streamers that you are following\n`,
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
            triggers: `toSkinTimer`,
            typeOfResponse: `function`,
            description: `calculates time since we've got the last Viktor skin\n`,
            isAvailable: true,
            isModCommand: false
        },
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
            chanceOfTriggering: 70
        },
        ':questionmark:': {
            triggers: `<:questionmark:244535324737273857>`,
            typeOfResponse: `text`,
            chanceOfTriggering: 30
        },
        'shrug': {
            triggers: `¯\\\\_ <:viktor:232941841815830536> \\_/¯`,
            typeOfResponse: `text`,
            chanceOfTriggering: 70
        },
        'notice me+senpai': {
            triggers: `_looks away, unamused_`,
            typeOfResponse: `text`,
            chanceOfTriggering: 80
        },
        'ily+ vik': {
            triggers: `http://i.imgur.com/yuXRObM.png`,
            typeOfResponse: `text`,
            chanceOfTriggering: 10
        },
        'expirence': {
            triggers: `_**e x p e r i e n c e**_ <:JustDieAlready:288399448176853012>`,
            typeOfResponse: `text`,
            chanceOfTriggering: 100
        },
        ' build+ vik': {
            triggers: `It's highly advised to check the !build command.`,
            typeOfResponse: `text`,
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
        'kys': {
            emoteResponse: `<:salt:289489052212789250>`,
            chanceOfTriggering: 2
        },
        'smh': {
            emoteResponse: `:vikfacepalm:305783369302802434`,
            chanceOfTriggering: 20
        },
        ' cat ': {
            emoteResponse: `🐱`,
            chanceOfTriggering: 2
        },
        'you suck': {
            emoteResponse: `🥇`,
            chanceOfTriggering: 2
        }
    };
};