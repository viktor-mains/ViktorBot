import { log } from '../log';
import { chooseRandom } from '../lib/rng';
import * as dearViktor from '../data/dearviktor.json';
import * as commands from '../data/commands.json';

const isChannelDM = msg => msg.author.id === msg.channel.id;

const isUserAdmin = msg => msg.member.hasPermission(checkAdmin);
const isUserBot = msg => msg.author.bot;
const isUserArcy = msg => msg.author.id === '165962236009906176';

const messageStartsWithCommandSymbol = msg => msg.content.startsWith(commands.options.commandSymbol);

const isMessageRant = msg => msg.content === msg.content.toUpperCase() && msg.content.length > 20;
const isMessageCommand = msg => commands.list.find(cmd => cmd.keyword === message.getKeyword(msg));
const isMessageDearViktor = msg => msg.content.toLowerCase().startsWith('dear viktor');
const isMessageDearVictor = msg => msg.content.toLowerCase().startsWith('dear victor');

export const message = {
    classify: msg => {
        if (isMessageRant(msg))
            msg.react('🍿');

        if (isChannelDM(msg) && !isUserArcy(msg))
            return message.answer(msg, 'Only my glorious creator can talk to me in private.');
        if (isMessageDearViktor(msg))
            return message.answerDearViktor(msg);
        if (isMessageDearVictor(msg))
            return message.answerDearVictor(msg);

        if (messageStartsWithCommandSymbol(msg)) 
            return message.answerCommand(msg);
    },

    answer: (msg, answer) => msg.channel.send(answer),

    answerDearViktor: msg => {
        if (msg.content.endsWith('?')) {
            const keywordDetected = dearViktor.keywords.find(
                category => category.list.find(
                    keyword => msg.content.toLowerCase().indexOf(keyword) !== -1)
                );
            keywordDetected
                ? message.answer(msg, chooseRandom(dearViktor.answers[keywordDetected.id]))
                : message.answer(msg, chooseRandom(dearViktor.answers.yesno))
            return;
        }
        message.answer(msg, '_That_ doesn\'t look like question to me.')
    },            

    answerDearVictor: msg => message.answer(msg, '...what have you just call me. <:SilentlyJudging:288396957922361344>'),

    answerCommand: msg => {
        if (!isMessageCommand(msg))
            return msg.react(':questionmark:244535324737273857');
        return message.answer(msg, message.returnCommand(msg));
    },

    getKeyword: msg => {
        const argumentsPresent = msg.content.indexOf(' ') !== -1;
        return argumentsPresent
            ? msg.content.substring(1, msg.content.indexOf(' '))
            : msg.content.substring(1);
    },

    returnCommand: msg => {
        const cmd = commands.list.find(cmd => cmd.keyword === message.getKeyword(msg));
        if (cmd)
            return cmd.response;
    }
}