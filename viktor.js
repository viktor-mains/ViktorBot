const Discord = require('discord.js');

var UserMessage = require('./classes/usermessage.js');
var Answer = require('./classes/answer.js');
var Data = require('./classes/data.js');

var Roles = require('./classes/roles.js');
var Stream = require('./classes/stream.js');
var Ban = require('./classes/ban.js');

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
        var ban = new Ban.Ban(data);
        if (ban.newUserIsNameBlacklisted(message.author) || (ban.newUserIsIDBlacklisted(message.author))) {
            console.log(`${message.author.username}#${message.author.discriminator}: ${message.content}`);
            return;
        }
        if (!data.userIsArcy() && data.userIsNotThisBot()) {
            message.reply(`Only my glorious creator is allowed to talk to me in private.`);
            return;
        }
    }//this triggers when message was sent in DM

    try {
        if (data.userIsNotThisBot()) {
            var userMessage = new UserMessage.UserMessage(data);
            var answer = new Answer.Answer(data);

            answer.toEmoteReactionTrigger();
            if (userMessage.hasCapsLockTrigger())
                answer.toCapsLock();
            if (userMessage.hasCommandTrigger())
                return answer.toCommand();
            if (userMessage.hasDearViktorTrigger())
                return answer.toDearViktor();
            return answer.toKeyword();
        }
    }
    catch (err) {
        console.log(`\n\n!!! ${err} !!!\n\n`);
    }
});

bot.on('messageUpdate', (oldMessage, newMessage) => {
    var data = new Data.Data(oldMessage, bot);

    try { data.whatServer(oldMessage.channel.guild.id); }
    catch (err) { }//this triggers when message was sent in DM

    try {
        if (data.userIsNotThisBot()) {
            var embed = new Discord.RichEmbed()
                .setTitle(`MESSAGE EDITED`)
                .setColor(0x83C4F2)
                .setDescription(`**Author:** \`\`${oldMessage.author.username}#${oldMessage.author.discriminator}\`\`` +
                `\n**Timestamp:**\`\`${oldMessage.createdTimestamp}\`\`` +
                `\n**Channel:** <#${oldMessage.channel.id}>`)
                .addField(`Old message`,
                `\n\`\`\`${oldMessage.content}\`\`\``, true)
                .addField(`New message`,
                `\n\`\`\`${newMessage.content}\`\`\``, true);
            bot.channels.get(data.logChannel).send({ embed });
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
            var embed = new Discord.RichEmbed()
                .setTitle(`MESSAGE DELETED`)
                .setColor(0xC70000)
                .setDescription(`**Author:** \`\`${message.author.username}#${message.author.discriminator}\`\`` +
                `\n**Timestamp:**\`\`${message.createdTimestamp}\`\`` +
                `\n**Channel:** <#${message.channel.id}>`)
                .addField(`Content`,
                `\n\`\`\`${message.content}\`\`\``, false)
            bot.channels.get(data.logChannel).send({ embed });
        }
    }
    catch (err) {
        console.log('\n\BUG IN MESSAGE DELETE EVENT' + err);
    }
});

bot.on('guildMemberAdd', GuildMember => {
    var data = new Data.Data('', bot);
    var d = new Date();

    try { data.whatServer(GuildMember.guild.id); }
    catch (err) { }//this triggers when message was sent in DM

    console.log(`${d} - new member - ${GuildMember.user.username}#${GuildMember.user.discriminator}\n`);

    if (data.server == `vikmains`) {
        var ban = new Ban.Ban(data);
        if (ban.newUserIsNameBlacklisted(GuildMember.user) || (ban.newUserIsIDBlacklisted(GuildMember.user)))
            return ban.handleUserFromBlacklist(GuildMember);
        GuildMember.user.send(data.welcomeMessageForViktorMains);
    }

    var embed = new Discord.RichEmbed()
        .setTitle(`USER JOINS`)
        .setColor(0x51E61C)
        .setDescription(`**User:** \`\`${GuildMember.user.username}#${GuildMember.user.discriminator}\`\`` +
        `\n**Joined at:**\`\`${GuildMember.joinedAt}\`\``);
    bot.channels.get(data.logChannel).send({ embed });
});

bot.on('guildMemberRemove', GuildMember => {
    var data = new Data.Data('', bot);
    var d = new Date();

    try { data.whatServer(GuildMember.guild.id); }
    catch (err) { }//this triggers when message was sent in DM

    console.log(`${d} - member left - ${GuildMember.user.username}#${GuildMember.user.discriminator}\n`);

    var embed = new Discord.RichEmbed()
        .setTitle(`USER LEAVES`)
        .setColor(0xFDC000)
        .setDescription(`**User:** \`\`${GuildMember.user.username}#${GuildMember.user.discriminator}\`\`` +
        `\n**Leaves at:** \`\`${d}\`\``);
    bot.channels.get(data.logChannel).send({ embed });
});

bot.on('presenceUpdate', (oldMember, newMember) => {   
    var data = new Data.Data('', bot);
    var d = new Date();
    var roles = new Roles.Roles(newMember);
    var stream = new Stream.Stream(newMember);
    var game = newMember.presence.game;

    try { data.whatServer(newMember.guild.id); }
    catch (err) { }//this triggers when message was sent in DM

    if (data.server == `vikmains`) {
        try {
            if (stream.userStreams(game) && stream.isViktorStreamer()) //add another requirement being the "Viktor Streamer" being assigned to them
                stream.addStreamingRoleIfTheyDontHaveItYet();
            if (stream.userDoesntStream(game))
                stream.removeStreamingRoleIfTheyStoppedStreaming();
        }
        catch (err) {
            console.log(`${d} - ${err} while removing streaming role from ${newMember.user.username}\n`);
        }
    }
});