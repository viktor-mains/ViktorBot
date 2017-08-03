const Discord = require('discord.js');

var UserMessage = require('./classes/usermessage.js');
var Answer = require('./classes/answer.js');
var Data = require('./classes/data.js');

var Roles = require('./classes/roles.js');
var Stream = require('./classes/stream.js');
var Ban = require('./classes/mod/ban.js');

const bot = new Discord.Client();
const token = process.env.VIKTOR_DISCORD_TOKEN;

bot.login(token);

bot.on('ready', () => {
    var d = new Date();
    bot.user.setGame(`!h for help`);
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
                var MessageCount = require('./classes/mod/messageCount.js');
                var mc = new MessageCount.MessageCount(data);
                var userMessage = new UserMessage.UserMessage(data);
                var answer = new Answer.Answer(data);

                mc.increment((worked, antispamOn) => {
                    if (worked && antispamOn)
                        mc.checkAntiSpam(); 
                });
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
        if (data.userIsNotThisBot()) {
            var Post = require('./classes/post.js');
            var post = new Post.Post(data);

            post.embedToChannel(`:clipboard: MESSAGE EDITED`, [
                [`Author`, `${oldMessage.author.username}#${oldMessage.author.discriminator}`, true],
                [`Timestamp`, oldMessage.createdTimestamp, true],
                [`Channel`, `<#${oldMessage.channel.id}>`, true],
                [`Old message`, `\`\`\`${oldMessage.content}\`\`\``, false],
                [`New message`, `\`\`\`${newMessage.content}\`\`\``, false]
                ], data.logChannel, '83C4F2');
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
        if (data.userIsNotThisBot()) {
            var Post = require('./classes/post.js');
            var post = new Post.Post(data);

            post.embedToChannel(`:no_mobile_phones: MESSAGE DELETED`, [
                [`Author`, `${message.author.username}#${message.author.discriminator}`, true],
                [`Timestamp`, message.createdTimestamp, true],
                [`Channel`, `<#${message.channel.id}>`, true],
                [`Content`, `\`\`\`${message.content}\`\`\``, false]
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
        console.log(`${d} - new member - ${GuildMember.user.username}#${GuildMember.user.discriminator}\n`);
        post.embedToChannel(`:man: USER JOINS`, [
            [`User`, `${GuildMember.user.username}#${GuildMember.user.discriminator}`, true],
            [`Joined at`, GuildMember.joinedAt, true]
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

    console.log(`${d} - member left - ${GuildMember.user.username}#${GuildMember.user.discriminator}\n`);

    post.embedToChannel(`:wave: USER LEAVES`, [
        [`User`, `${GuildMember.user.username}#${GuildMember.user.discriminator}`, true],
        [`Leaves at`, d, true]
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