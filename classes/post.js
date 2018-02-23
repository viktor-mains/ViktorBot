const Discord = require('discord.js');

exports.Post = function (data) {
    var post = this;

    post.editedMessage = function (userMessage, editedContent) {
        userMessage.edit(editedContent);
    };
    post.message = function (messageToPost) {
        data.message.channel.send(messageToPost);
    };
    post.messageToChannel = function (messageToPost, channelToPost) {
        data.bot.channels.get(channelToPost).send(messageToPost);
    };
    post.embed = function (title, embedTitleBodyAndArgs, color) {
        var embed;
        if (color)
            embed = new Discord.RichEmbed()
                .setTitle(title)
                .setColor(`0x${color}`);
        else
            embed = new Discord.RichEmbed()
                .setTitle(title)
                .setColor(0xFDC000);
        for (var i = 0; i < embedTitleBodyAndArgs.length; i++){
            embed.addField(embedTitleBodyAndArgs[i][0],
                embedTitleBodyAndArgs[i][1],
                embedTitleBodyAndArgs[i][2]);
            if (i === embedTitleBodyAndArgs.length-1) {
                data.message.channel.send({ embed });
                break;
            }
        }
    };
    post.embedToChannel = function (title, embedTitleBodyAndArgs, channelToPost, color) {
        var embed;
        if (color)
            embed = new Discord.RichEmbed()
                .setTitle(title)
                .setColor(`0x${color}`);
        else 
            embed = new Discord.RichEmbed()
                .setTitle(title)
                .setColor(0xFDC000);
        for (var i = 0; i < embedTitleBodyAndArgs.length; i++) {
            embed.addField(embedTitleBodyAndArgs[i][0],
                embedTitleBodyAndArgs[i][1],
                embedTitleBodyAndArgs[i][2]);
            if (i === embedTitleBodyAndArgs.length - 1) {
                data.bot.channels.get(channelToPost).send({ embed });
                break;
            }
        }
    };
    post.embedToDM = function (title, embedTitleBodyAndArgs, channelToPost) {
        var embed = new Discord.RichEmbed()
            .setTitle(title)
            .setColor(0xFDC000);
        for (var i = 0; i < embedTitleBodyAndArgs.length; i++) {
            embed.addField(embedTitleBodyAndArgs[i][0],
                embedTitleBodyAndArgs[i][1],
                embedTitleBodyAndArgs[i][2]);
            if (i === embedTitleBodyAndArgs.length - 1) {
                data.message.author.send({ embed })
                    .then(m => post.reactionToMessage('📩'))
                    .catch(err => {
                        return post.embed(":warning: I'm unable to reply to you!", ["___", `This command sends the reply to your DM, and it seems you have DMs from members of this server disabled.
                        \n\nTo be able to receive messages from me, go to \`\`User Settings => Privacy & Safety => Allow direct messages from server members\`\` and then resend the command!`, false]);
                    });
                break;
            }
        }
    };
    post.reactionToMessage = function (reactionEmoji) {
        data.message.react(reactionEmoji);
    };
    post.newStatus = function (newStatus) {
        data.bot.user.setPresence({ game: { name: newStatus, type: 0 } });
    };
    post.toDM = function (messageToSend) {
        data.message.author.send(messageToSend)
            .then(m => post.reactionToMessage('📩'))
            .catch(err => {
                return post.embed("", [[":warning: I'm unable to reply to you!",
                    `This command sends the reply to your DM, and it seems you have DMs from members of this server disabled.
                        \n\nTo be able to receive messages from me, go to \`\`User Settings => Privacy & Safety => Allow direct messages from server members\`\` and then resend the command!`,
                    false]]);
            });
    };
};