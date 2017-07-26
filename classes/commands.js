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
 *  @isModCommand - self-explanatory
 *  @isAvailable - self-explanatory
 *  <@refusal> - a special response which gets sent instead of standard one, if bot decides to refuse to execute the command
 *  <@title> - title for embed messages (required).
 *  <@arguments> - arguments for functions. If function triggers an embed, use this to pass title instead of <title>.
 *  <@postInChannel> - directs the bot's response into the channel which ID is given. If value='DM' will send DM.
*/
    commands.listOfResponses = {
        'beep': {
            triggers: `_sighs deeply_\nBeep. Boop.`,
            typeOfResponse: `text`,
            isAvailable: true,
            isModCommand: false
        },
        'build': {
            triggers: 'toBuild',
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false,
            arguments: `**♥ GLORIOUS MINIGUIDE TO BUILD ♥**`
        },
        'choose': {
            triggers: `toChoose`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false
        },
        'clubs': {
            triggers: `https://www.reddit.com/r/viktormains/wiki/clubs - the list of NA/EUW/EUNE in-game clubs we know about.`,
            typeOfResponse: `text`,
            isAvailable: true,
            isModCommand: false
        },
        'dun': {
            triggers: `- OP.gg - https://na.op.gg/summoner/userName=dunv2\n- Stream - http://twitch.tv/dunlol`,
            typeOfResponse: `embed`,
            isAvailable: true,
            isModCommand: false,
            title: `Dun, Challenger Viktor main`
        },
        'faq': {
            triggers: `Useful tips and tricks for new Viktor players: https://www.reddit.com/r/viktormains/wiki/faq`,
            typeOfResponse: `text`,
            isAvailable: true,
            isModCommand: false
        },
        'gibeskin': {
            triggers: `toSkinTimer`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false
        },
        'giveid': {
            triggers: `toPlayerIDRequest`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: true
        },
        'iamnot': {
            triggers: `toIAmNotCommand`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false
        },
        'iam': {
            triggers: `toIAmCommand`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false
        },
        'impersonate': {
            triggers: `toImpersonate`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: true
        },
        'ingame': {
            triggers: `toLiveGameRequest`,
            arguments: `:game_die:`,
            typeOfResponse: `function`,
            isAvailable: false,
            isModCommand: false
        },
        'joke': {
            triggers: `I won't waste my precious time for the sake of your personal amusement.`,
            typeOfResponse: `text`,
            isAvailable: true,
            isModCommand: false
        },
        'lastgame': {
            triggers: `toLastGameRequest`,
            typeOfResponse: `function`,
            isAvailable: false,
            isModCommand: false
        },
        'locateserver': {
            triggers: `locateServer`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: true
        },
        'h': {
            triggers: answer.toHelp,
            typeOfResponse: `text`,
            postInChannel: `DM`,
            isAvailable: true,
            isModCommand: false
        },
        'help': {
            triggers: answer.toHelp,
            typeOfResponse: `text`,
            postInChannel: `DM`,
            isAvailable: true,
            isModCommand: false
        },
        'commands': {
            triggers: answer.toHelp,
            typeOfResponse: `text`,
            postInChannel: `DM`,
            isAvailable: true,
            isModCommand: false
        },
        'opgg': {
            triggers: `toOPGG`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false,
            refusal: `I don't think you want to show _that_  to everyone.`
        },
        'pbe': {
            triggers: `toPBE`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false
        },
        'mastery': {
            triggers: `toViktorMastery`,
            arguments: `<:viktorgod:269479031009837056> Viktor mastery points for`,
            typeOfResponse: `function`,
            isAvailable: false,
            isModCommand: false
        },
        'matchup': {
            triggers: `toMatchup`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false
        },
        'meow': {
            triggers: `toCatPicture`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false,
            refusal: `You have been given an opportunity to ask me, an evolved being, for anything; and you ask for a cat photo. _Really?_\n`
        },
        'mod': {
            triggers: `editModPrivileges`,
            typeOfResponse: `function`,
            arguments: `promote`,
            isAvailable: true,
            isModCommand: true
        },
        'unmod': {
            triggers: `editModPrivileges`,
            typeOfResponse: `function`,
            arguments: `demote`,
            isAvailable: true,
            isModCommand: true
        },
        'modlist': {
            triggers: `editModPrivileges`,
            typeOfResponse: `function`,
            arguments: `list`,
            isAvailable: true,
            isModCommand: true
        },
        'challengerrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Challenger+Master+Diamond`
        },
        'masterrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Master+Diamond+Platinum`
        },
        'diamondrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Diamond+Platinum+Gold`
        },
        'platinumrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Platinum+Gold+Silver`
        },
        'goldrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Gold+Silver+Bronze`
        },
        'silverrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false,
            arguments: `Silver+Bronze+Unranked`
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
            isAvailable: true,
            isModCommand: false
        },
        'roles': {
            triggers: `- servers: BR | EUW | EUNE | NA | JP | CN | SEA | KR | LAN | LAS | OCE | RU | TR\n` +
            `- are you a Viktor streamer? Type !iam Viktor Streamer\n`,
            title: `Self-assignable roles`,
            typeOfResponse: `embed`,
            isAvailable: true,
            isModCommand: false
        },
        'setstatus': {
            triggers: `toStatusChangeRequest`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: true
        },
        'test': {
            triggers: answer.toTest,
            typeOfResponse: `text`,
            isAvailable: true,
            isModCommand: true
        },
        'woof': {
            triggers: `toDogPicture`,
            typeOfResponse: `function`,
            isAvailable: true,
            isModCommand: false,
            refusal: `You have been given an opportunity to ask me, an evolved being, for anything; and you ask for a puppy photo. _Really?_\n`
        },
        'version': {
            triggers: answer.toVersion,
            typeOfResponse: `text`,
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