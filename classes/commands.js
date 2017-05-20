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
 *  <@refusal> - a special response which gets sent instead of standard one, if bot decides to refuse to execute the command
 *  <@title> - title for embed messages (required).
 *  <@arguments> - arguments for functions. If function triggers an embed, use this to pass title instead of <title>.
 *  <@postInChannel> - directs the bot's response into the channel which ID is given. If value='DM' will send DM.
*/
    commands.listOfResponses = {
        'beep': {
            triggers: `_sighs deeply_\nBeep. Boop.`,
            typeOfResponse: `text`,
            isModCommand: false
        },
        'build': {
            triggers: 'toBuild',
            typeOfResponse: `function`,
            isModCommand: false,
            arguments: `**♥ GLORIOUS MINIGUIDE TO BUILD ♥**`
        },
        'choose': {
            triggers: `toChoose`,
            typeOfResponse: `function`,
            isModCommand: false
        },
        'clubs': {
            triggers: `https://www.reddit.com/r/viktormains/wiki/clubs - the list of NA/EUW/EUNE in-game clubs we know about.`,
            typeOfResponse: `text`,
            isModCommand: false
        },
        'dun': {
            triggers: `- OP.gg - https://na.op.gg/summoner/userName=dunv2\n- Stream - http://twitch.tv/dunlol`,
            typeOfResponse: `embed`,
            isModCommand: false,
            title: `Dun, Challenger Viktor main`
        },
        'faq': {
            triggers: `Useful tips and tricks for new Viktor players: https://www.reddit.com/r/viktormains/wiki/faq`,
            typeOfResponse: `text`,
            isModCommand: false
        },
        'giveid': {
            triggers: `toPlayerIDRequest`,
            typeOfResponse: `function`,
            isModCommand: true
        },
        'iamnot': {
            triggers: `toIAmNotCommand`,
            typeOfResponse: `function`,
            isModCommand: false
        },
        'iam': {
            triggers: `toIAmCommand`,
            typeOfResponse: `function`,
            isModCommand: false
        },
        'impersonate': {
            triggers: `toImpersonate`,
            typeOfResponse: `function`,
            isModCommand: true
        },
        'ingame': {
            triggers: `toLiveGameRequest`,
            arguments: `:game_die:`,
            typeOfResponse: `function`,
            isModCommand: false
        },
        'joke': {
            triggers: `I won't waste my precious time for the sake of your personal amusement.`,
            typeOfResponse: `text`,
            isModCommand: false
        },
        'h': {
            triggers: answer.toHelp,
            typeOfResponse: `text`,
            postInChannel: `DM`,
            isModCommand: false
        },
        'help': {
            triggers: answer.toHelp,
            typeOfResponse: `text`,
            postInChannel: `DM`,
            isModCommand: false
        },
        'commands': {
            triggers: answer.toHelp,
            typeOfResponse: `text`,
            postInChannel: `DM`,
            isModCommand: false
        },
        'opgg': {
            triggers: `toOPGG`,
            typeOfResponse: `function`,
            isModCommand: false,
            refusal: `I don't think you want to show _that_  to everyone.`
        },
        'mastery': {
            triggers: `toViktorMastery`,
            arguments: `<:viktorgod:269479031009837056> Viktor mastery points for`,
            typeOfResponse: `function`,
            isModCommand: false
        },
        'matchup': {
            triggers: `toMatchup`,
            typeOfResponse: `function`,
            isModCommand: false
        },
        'meow': {
            triggers: `toCatPicture`,
            typeOfResponse: `function`,
            isModCommand: false,
            refusal: `You have been given an opportunity to ask me, an evolved being, for anything; and you ask for a cat photo. _Really?_\n`
        },
        'masterrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            isModCommand: false,
            arguments: `Master+Diamond`
        },
        'diamondrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            isModCommand: false,
            arguments: `Diamond+Platinum`
        },
        'platinumrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            isModCommand: false,
            arguments: `Platinum+Gold`
        },
        'goldrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            isModCommand: false,
            arguments: `Gold+Silver`
        },
        'silverrace': {
            triggers: `toRace`,
            typeOfResponse: `function`,
            isModCommand: false,
            arguments: `Silver+Bronze`
        },
        'roles': {
            triggers: `- servers: BR | EUW | EUNE | NA | JP | Garena | KR | LAN | LAS | OCE | RU | TR\n` +
            `- are you a Viktor streamer? Type !iam Viktor Streamer\n`,
            title: `Self-assignable roles`,
            typeOfResponse: `embed`,
            isModCommand: false
        },
        'setstatus': {
            triggers: `toStatusChangeRequest`,
            typeOfResponse: `function`,
            isModCommand: true
        },
        'test': {
            triggers: answer.toTest,
            typeOfResponse: `text`,
            isModCommand: true
        },
        'woof': {
            triggers: `toDogPicture`,
            typeOfResponse: `function`,
            isModCommand: false,
            refusal: `You have been given an opportunity to ask me, an evolved being, for anything; and you ask for a puppy photo. _Really?_\n`
        },
        'version': {
            triggers: answer.toVersion,
            typeOfResponse: `text`,
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
            emoteResponse: `🍿`,
            chanceOfTriggering: 2
        },
        'smh': {
            emoteResponse: `:vikfacepalm:305783369302802434`,
            chanceOfTriggering: 20
        },
        'cat': {
            emoteResponse: `🐱`,
            chanceOfTriggering: 2
        },
        'you suck': {
            emoteResponse: `🥇`,
            chanceOfTriggering: 2
        }
    };
};