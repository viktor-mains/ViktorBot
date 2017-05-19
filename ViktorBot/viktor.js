const Discord = require('discord.js');

var UserMessage = require('./classes/usermessage.js');
var Answer = require('./classes/answer.js');
var Data = require('./classes/data.js');

var Roles = require('./classes/roles.js');
var Stream = require('./classes/stream.js');

const bot = new Discord.Client();
const token = process.env.API_KEY;

bot.login(token);
bot.on('ready', () => {
    var d = new Date();
    bot.user.setGame(`on Arcy's nerves`);
    console.log(`${d} - ${bot.user.username} starts working!`);
});

bot.on('message', message => {
    var data = new Data.Data(message, bot);

    try { data.whatServer(message.channel.guild.id); }
    catch (err) { }//this triggers when message was sent in DM

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
        console.log('\n\n!!! SOME BIGGER BUG !!!\n\n' + err);
    }
});

bot.on('presenceUpdate', (oldMember, newMember) => {
    var roles = new Roles.Roles(newMember);
    var stream = new Stream.Stream(newMember);
    var game = newMember.presence.game;

    try {
        if (game && game.url) //add another requirement being the "Viktor Streamer" being assigned to them
            stream.addStreamingRoleIfTheyDontHaveItYet();
        if (!game || (game && !game.url))
            stream.removeStreamingRoleIfTheyStoppedStreaming();
    }
    catch (err) {
        console.log(`${err} while managing streaming role for user ${newMember.user.username}`);
    }
});