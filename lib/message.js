import { log } from '../log';
import { 
    chooseRandom,
    botRefuses,
    happensWithAChanceOf,
} from '../lib/rng';
import * as dearViktor from '../data/dearviktor.json';
import * as commands from '../data/commands.json';
import reactions from '../data/reactions.json';

export const classifyMessage = msg => {
    if (isUserBot(msg))
        return;
    if (isMessageDearViktor(msg))
        return answerDearViktor(msg);
    if (isMessageDearVictor(msg))
        return answerDearVictor(msg);

    if (isChannelDM(msg) && !isUserArcy(msg))
        return answer(msg, 'Only my glorious creator can talk to me in private.');

    if (messageStartsWithCommandSymbol(msg)) 
        return answerCommand(msg);

    checkForReactionKeywords(msg);
}

const isChannelDM = msg => msg.author.id === msg.channel.id;

const isUserAdmin = msg => msg.member.hasPermission('ADMINISTRATOR');
const isUserBot = msg => msg.author.bot;
const isUserArcy = msg => msg.author.id === '165962236009906176';

const messageStartsWithCommandSymbol = msg => msg.content.startsWith(commands.options.commandSymbol);

const isMessageRant = msg => msg.content === msg.content.toUpperCase() && msg.content.length > 20;
const isMessageDearViktor = msg => msg.content.toLowerCase().startsWith('dear viktor');
const isMessageDearVictor = msg => msg.content.toLowerCase().startsWith('dear victor');


const answer = (msg, answer) => msg.channel.send(answer);

const answerDearViktor = msg => {
    if (msg.content.endsWith('?')) {
        const keywordDetected = dearViktor.keywords.find(
            category => category.list.find(
                keyword => msg.content.toLowerCase().indexOf(keyword) !== -1)
            );
        keywordDetected
            ? answer(msg, chooseRandom(dearViktor.answers[keywordDetected.id]))
            : answer(msg, chooseRandom(dearViktor.answers.yesno))
        return;
    }
    answer(msg, '_That_ doesn\'t look like question to me.')
};

const answerDearVictor = msg => answer(msg, '...what have you just call me. <:SilentlyJudging:288396957922361344>');

const answerCommand = msg => {
    const cmd = commandObject(msg);

    if (!cmd)
        return msg.react(':questionmark:244535324737273857');
    if (cmd.isDisabled)
        return msg.react('🚧');
    if (cmd.isModCommand && isUserAdmin(msg))
        return msg.react('🚫');
    if (botRefuses())
        return cmd.refusal || 'I won\'t execute your petty command.';

    return answer(msg, cmd.response.content);
};

const checkForReactionKeywords = msg => {
    const appropiateReactions = reactions.filter(reaction => msg.content.indexOf(reaction.keyword) !== -1);
    if (appropiateReactions.length === 0)
        return;
    const chosenKeyword = chooseRandom(appropiateReactions);
    const chosenReaction = chosenKeyword.list.find(reaction => happensWithAChanceOf(reaction.chance));
    if (chosenReaction)
        msg.react(chosenReaction.emoji);
};

const commandObject = msg => commands.list.find(cmd => cmd.keyword === getKeyword(msg));

const getKeyword = msg => {
    const argumentsPresent = msg.content.indexOf(' ') !== -1;
    const keyword = argumentsPresent
        ? msg.content.substring(1, msg.content.indexOf(' '))
        : msg.content.substring(1);
    return keyword;
};
