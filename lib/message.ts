declare const require: any;

const dearViktor = require('../data/dearviktor.json');
const commands = require('../data/commands.json');
const reactions = require('../data/reactions.json');

import { log } from '../log';
import { 
    chooseRandom,
    botRefuses,
    happensWithAChanceOf,
} from './rng';

import { ICommand } from './interfaces/command';
import { 
    IReaction, 
    IReactionDetails 
} from './interfaces/reaction';
import { 
    IDearViktor, 
    IDVKeywords 
} from './interfaces/dearviktor';

// logic

export const classifyMessage = (msg:any) => {
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

const isChannelDM = (msg:any) => msg.author.id === msg.channel.id;

const isUserAdmin = (msg:any) => msg.member.hasPermission('ADMINISTRATOR');
const isUserBot = (msg:any) => msg.author.bot;
const isUserArcy = (msg:any) => msg.author.id === '165962236009906176';

const messageStartsWithCommandSymbol = (msg:any) => msg.content.startsWith(commands.options.commandSymbol);

const isMessageRant = (msg:any) => msg.content === msg.content.toUpperCase() && msg.content.length > 20;
const isMessageDearViktor = (msg:any) => msg.content.toLowerCase().startsWith('dear viktor');
const isMessageDearVictor = (msg:any) => msg.content.toLowerCase().startsWith('dear victor');


const answer = (msg:any, answer:string) => msg.channel.send(answer);

const answerDearViktor = (msg:any) => {
    if (msg.content.endsWith('?')) {
        const keywordDetected = dearViktor.keywords.find(
            (category:IDVKeywords) => category.list.find(
                (keyword:string) => msg.content.toLowerCase().indexOf(keyword) !== -1)
            );
        keywordDetected
            ? answer(msg, chooseRandom(dearViktor.answers[keywordDetected.id]))
            : answer(msg, chooseRandom(dearViktor.answers.yesno))
        return;
    }
    answer(msg, '_That_ doesn\'t look like question to me.')
};

const answerDearVictor = (msg:any) => answer(msg, '...what have you just call me. <:SilentlyJudging:288396957922361344>');

const answerCommand = (msg:any) => {
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

const checkForReactionKeywords = (msg:any) => {
    const appropiateReactions = reactions.filter((reaction:IReaction) => msg.content.indexOf(reaction.keyword) !== -1);
    if (appropiateReactions.length === 0)
        return;
    const chosenKeyword = chooseRandom(appropiateReactions);
    const chosenReaction = chosenKeyword.list.find((reaction:IReactionDetails) => happensWithAChanceOf(reaction.chance));
    if (chosenReaction)
        msg.react(chosenReaction.emoji);
};

const commandObject = (msg:any) => commands.list.find((cmd:ICommand) => cmd.keyword === getKeyword(msg));

const getKeyword = (msg:any) => {
    const argumentsPresent = msg.content.indexOf(' ') !== -1;
    const keyword = argumentsPresent
        ? msg.content.substring(1, msg.content.indexOf(' '))
        : msg.content.substring(1);
    return keyword;
};
