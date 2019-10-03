const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');
const token = config.DISCORD_TOKEN;

var UserMessage = require('./classes/usermessage.js');
var Answer = require('./classes/answer.js');
var Data = require('./classes/data.js');
var Roles = require('./classes/roles.js');
var Stream = require('./classes/stream.js');
var Ban = require('./classes/mod/ban.js');
var MessageCount = require('./classes/mod/messageCount.js');
var messageCount;

var msgCache = {
    "data": {},
    "antispam": false,
    "spamCount": 4,
    "spamTime": 20
};

// bot events
bot.login(token);

bot.on('ready', () => {
    var d = new Date();

    messageCount = new MessageCount.MessageCount();
    messageCount.getMsgData(mcd => {
        msgCache.data = mcd;
        timerOn();
        //fetchRedComments();
    });

    bot.user.setPresence({ game: { name: `!h for help`, type: 0 } });
    console.log(`${d} - ${bot.user.username} starts working!\n`);
});

bot.on('message', message => {
    var data = new Data.Data(message, bot);

    try { data.whatServer(message.channel.guild.id); }
    catch (err) {
        if (!data.userIsArcy() && data.userIsNotThisBot()) {
            message.reply(`Only my glorious creator is allowed to talk to me in private.`);
            return;
        };
    };

    data.loadServerData(() => {
        if (data.userIsNotThisBot() && !data.message.author.bot) {
            try {
                var userMessage = new UserMessage.UserMessage(data);
                var answer = new Answer.Answer(data);

                messageCount.increment(msgCache.data, message);
                
                answer.toEmoteReactionTrigger();
                if (userMessage.hasCapsLockTrigger())
                    answer.toCapsLock();
                if (userMessage.hasCommandTrigger())
                    return answer.toCommand();
                if (userMessage.hasDearViktorTrigger())
                    return answer.toDearViktor();
                return answer.toKeyword();
            }
            catch (err) {
                var d = new Date();
                console.log(`\n${d} - message post - ${err}`);
            };
        }
    });
});

bot.on('messageUpdate', (oldMessage, newMessage) => {
    var data = new Data.Data(oldMessage, bot);

    try { data.whatServer(oldMessage.channel.guild.id); }
    catch (err) { }//this triggers when message was sent in DM

    try {
        if (data.userIsNotThisBot() && !data.message.author.bot) {
            if (oldMessage.content !== newMessage.content) {
                var Post = require('./classes/post.js');
                var post = new Post.Post(data);
                var oldTimestamp = new Date(oldMessage.createdTimestamp);
                var newTimestamp = new Date(newMessage.editedTimestamp);
                var oldMes = oldMessage.content;
                var newMes = newMessage.content;
                if (oldMes == '')
                    oldMes = '_<empty message or picture>_';
                if (newMes == '')
                    newMes = '_<empty message or picture>_';

                oldTimestamp = oldTimestamp.toISOString();
                newTimestamp = newTimestamp.toISOString();

                post.embedToChannel(`:clipboard: MESSAGE EDITED`, [
                    [`Author`, `${oldMessage.author.username}#${oldMessage.author.discriminator}`, true],
                    [`Channel`, `<#${oldMessage.channel.id}>`, true],
                    [`Old message`, oldMes, false],
                    [`New message`, newMes, false],
                    [`Created at`, oldTimestamp, true],
                    [`Edited at`, newTimestamp, true]
                ], data.logChannel, '83C4F2');
            }
        }
    }
    catch (err) {
        console.log('\n\BUG IN MESSAGE UPDATE EVENT' + err); 
    }
});

bot.on('messageDelete', message => {
    var data = new Data.Data(message, bot);

    try { data.whatServer(message.channel.guild.id); }
    catch (err) { }//this triggers when message was sent in DM

    try {
        if (data.userIsNotThisBot() && !data.message.author.bot) {
            var Post = require('./classes/post.js');
            var post = new Post.Post(data);
            var oldTimestamp = new Date(message.createdTimestamp);
            var newTimestamp = new Date();
            var delMessage = message.content;
            var attachments = message.attachments 
                ? message.attachments.map(att => att.proxyURL).join(' ')
                : 'none';
            if (delMessage == '')
                delMessage = `_<empty message or picture>_`;
            oldTimestamp = oldTimestamp.toISOString();
            newTimestamp = newTimestamp.toISOString();

            post.embedToChannel(`:no_mobile_phones: MESSAGE DELETED`, [
                [`Author`, `${message.author.username}#${message.author.discriminator}`, true],
                [`Channel`, `<#${message.channel.id}>`, true],
                [`Content`, delMessage, false],
                [`Attachments`, attachments, false],
                [`Created at`, oldTimestamp, true],
                [`Deleted at`, newTimestamp, true]
            ], data.logChannel, 'C70000');
        }
    }
    catch (err) {
        console.log('\n\BUG IN MESSAGE DELETE EVENT' + err);
    }
});

bot.on('guildMemberAdd', GuildMember => {
    var data = new Data.Data('', bot);
    var d = new Date();
    var Post = require('./classes/post.js');
    var post = new Post.Post(data);
    var ban = new Ban.Ban(data);

    try { data.whatServer(GuildMember.guild.id); }
    catch (err) { }//this triggers when message was sent in DM

    ban.newUserIsBlacklisted(GuildMember, (isBanned, banIndex) => {
        if (isBanned) {
            ban.handleUserFromBlacklist(GuildMember, banIndex);
            return;
        }

        GuildMember.user.send(data.welcomeMessageForViktorMains);
        post.embedToChannel(`:man: USER JOINS`, [
            [`User`, `${GuildMember.user.username}#${GuildMember.user.discriminator}`, false],
            [`Joined at`, GuildMember.joinedAt.toISOString(), true]
        ], data.logChannel, '51E61C');
    });
});

bot.on('guildMemberRemove', GuildMember => {
    var data = new Data.Data('', bot);
    var d = new Date();
    var Post = require('./classes/post.js');
    var post = new Post.Post(data);

    try { data.whatServer(GuildMember.guild.id); }
    catch (err) { }//this triggers when message was sent in DM

    post.embedToChannel(`:wave: USER LEAVES`, [
        [`User`, `${GuildMember.user.username}#${GuildMember.user.discriminator}`, false],
        [`Leaves at`, d.toISOString(), true]
    ], data.logChannel, 'FDC000');
});

bot.on('presenceUpdate', (oldMember, newMember) => {   
    var data = new Data.Data('', bot);
    var d = new Date();
    var roles = new Roles.Roles(newMember);
    var stream = new Stream.Stream(newMember, data);
    var game = newMember.presence.game;

    try { data.whatServer(newMember.guild.id); }
    catch (err) { }//this triggers when message was sent in DM

    if (data.server == `vikmains`) { // || data.server == `arcytesting`) {
        try {
            if (stream.userStreams(game) && stream.isViktorStreamer())
                stream.addStreamingRoleIfTheyDontHaveItYet();
            if (stream.userDoesntStream(game))
                stream.removeStreamingRoleIfTheyStoppedStreaming();
        }
        catch (err) {
            console.log(`${d} - ${err} while removing streaming role from ${newMember.user.username}\n`);
        }
    }
});

// custom events
function timerOn() {
    setInterval(() => {
        var timestamp = new Date();
        if (timestamp.getSeconds() % 10 === 0) {
            messageCount.setMsgData(msgCache.data);
        }
    }, 1000);
};
function fetchRedComments() {
    require('es6-promise').polyfill();
    require('isomorphic-fetch');

    var naPath = `http://boards.na.leagueoflegends.com/en/redtracker.json`;
    var euwPath = `http://boards.euw.leagueoflegends.com/en/redtracker.json`;
    var message = [];

    setInterval(() => {
        require('es6-promise').polyfill();
        require('isomorphic-fetch');

        fetch(naPath, {
            mode: 'no-cors'
        }).then(naJ => naJ.json())
            .then(naJson => {
                fetch(euwPath, {
                    mode: 'no-cors'
                }).then(euJ => euJ.json())
                    .then(euwJson => {
                        var euwCom = '';
                        var naCom = '';

                        for (let i in naJson) {
                            if (naJson[i].comment &&
                                naJson[i].comment.message.toLowerCase().indexOf('viktor') != -1 &&
                                Date.now() - Date.parse(euwJson[i].comment.createdAt) < 60000) {
                                var date = new Date(naJson[i].comment.createdAt);
                                naCom += `- ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()} - ` +
                                    `** ${naJson[i].comment.user.name}: ** ` +
                                    `https://boards.na.leagueoflegends.com/en/c/${naJson[i].comment.discussion.application.shortName}/${naJson[i].comment.discussion.id}?comment=${naJson[i].comment.id}`;
                            }
                        }
                        if (naCom)
                            message.push(['NA:', naCom, false]);
                        for (let i in euwJson) {
                            if (euwJson[i].comment &&
                                euwJson[i].comment.message.toLowerCase().indexOf('viktor') != -1 &&
                                Date.now() - Date.parse(euwJson[i].comment.createdAt) < 60000) {
                                var date = new Date(euwJson[i].comment.createdAt);
                                euwCom += `- ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()} - ` +
                                    `** ${euwJson[i].comment.user.name}: ** ` +
                                    `https://boards.na.leagueoflegends.com/en/c/${euwJson[i].comment.discussion.application.shortName}/${euwJson[i].comment.discussion.id}?comment=${euwJson[i].comment.id}`;
                            }
                        }
                        if (euwCom)
                            message.push(['EUW:', euwCom, false]);
                        if (message) {
                            var data = new Data.Data('', bot);
                            var Post = require('./classes/post.js');
                            var post = new Post.Post(data);

                            post.embedToChannel('Viktor mentioned by Rioter on boards!', message, '207732593733402624', 'fdc000');
                        }
                    })
                    .catch(e => { console.log(e); })
            })
            .catch(e => { console.log(e); })
    }, 60000);
}