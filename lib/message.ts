import Discord from 'discord.js';

import { TextCommand } from './commands/logic';
import { Reaction } from './commands/reactions'

import dearViktor from '../data/global/dearviktor.json';

import { cache } from './storage/cache';
import { getKeyword, getCommandSymbol } from './helpers';
import { chooseRandom, happensWithAChanceOf } from './rng';
import { Command } from './commands/list';

import { 
    IReaction, 
    IReactionDetails 
} from './types/reaction';
import { IDVKeywords } from './types/dearviktor';

// LOGIC

const isUserAdmin = (msg:Discord.Message) => msg.member.hasPermission('ADMINISTRATOR');
const isChannelDM = (msg:Discord.Message) => msg.author.id === msg.channel.id;
const isUserBot = (msg:Discord.Message) => msg.author.bot;
const isUserArcy = (msg:Discord.Message) => msg.author.id === '165962236009906176';
const messageStartsWithCommandSymbol = (msg:Discord.Message) => msg.content.startsWith(getCommandSymbol());
const isMessageRant = (msg:Discord.Message) => msg.content === msg.content.toUpperCase() && msg.content.length > 20;
const isMessageDearViktor = (msg:Discord.Message) => msg.content.toLowerCase().startsWith('dear viktor');
const isMessageDearVictor = (msg:Discord.Message) => msg.content.toLowerCase().startsWith('dear victor');

const commandObject = (msg:Discord.Message) => cache["commands"].find(cmd => cmd.keyword === getKeyword(msg));

const answer = (msg:Discord.Message, answer:string) => msg.channel.send(answer);
const answerDearViktor = (msg:Discord.Message) => {
    if (msg.content.endsWith('?')) {
        const keywordDetected = dearViktor.keywords.find(
            (category:any) => category.list.find(
                (keyword:string) => msg.content.toLowerCase().includes(keyword))
            );
        keywordDetected
            ? answer(msg, chooseRandom(dearViktor.answers[keywordDetected.id]))
            : answer(msg, chooseRandom(dearViktor.answers.yesno))
        return;
    }
    answer(msg, '_That_ doesn\'t look like question to me.')
};
const answerDearVictor = (msg:Discord.Message) => answer(msg, '...what have you just called me. <:SilentlyJudging:288396957922361344>');
const answerCommand = (msg:Discord.Message) => {
    const command = commandObject(msg);
    if (command && command.text) {
        new TextCommand(command, msg).execute(command.text);
        return;
    }
    if (command && Command[getKeyword(msg)]) {
        Command[getKeyword(msg)](command, msg)
        return;
    }
    msg.react(':questionmark:244535324737273857');    
};
const checkForReactionTriggers = (msg:Discord.Message) => { 
    let appropiateReactions = new Array();
    let chosenTrigger;
    let chosenReaction;

    if (isMessageRant(msg)) 
        appropiateReactions.push(...cache["reactions"].filter((reaction:any) => reaction.id === 'rant'));
    appropiateReactions.push(...cache["reactions"].filter((reaction:any) => 
        reaction.keywords.filter((keyword:string) => msg.content.toLowerCase().includes(keyword)).length === reaction.keywords.length && reaction.keywords.length > 0));

    if (appropiateReactions.length === 0)
        return;
    chosenTrigger = chooseRandom(appropiateReactions);
    chosenReaction = chosenTrigger.reaction_list.find((reaction:IReactionDetails) => happensWithAChanceOf(reaction.chance));
    if (chosenReaction) {
        chosenReaction.emoji && msg.react(chosenReaction.emoji);
        chosenReaction.response && msg.channel.send(chosenReaction.response);
        chosenReaction.function && Reaction[chosenReaction.function] && Reaction[chosenReaction.function](msg);
    }
};

// MAIN FUNCTION

const classifyMessage = (msg:Discord.Message) => {
    if (isUserBot(msg)) {
        return;
    }
    if (isMessageDearViktor(msg)) {
        answerDearViktor(msg);
        return;
    }        
    if (isMessageDearVictor(msg)) {
        answerDearVictor(msg);
        return;
    }
    if (isChannelDM(msg) && !isUserArcy(msg)) {
        answer(msg, 'Only my glorious creator can talk to me in private.');
        return;
    }
    if (messageStartsWithCommandSymbol(msg)) {
        answerCommand(msg);
        return;
    }
    checkForReactionTriggers(msg);
}

export { classifyMessage, isUserAdmin };