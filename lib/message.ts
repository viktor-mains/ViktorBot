import Discord from 'discord.js';
import { TextCommand, EmbedCommand } from './commands/logic';
import { Reaction } from './commands/reactions';
import { getKeyword, getCommandSymbol } from './helpers';
import {
	handleUserNotInDatabase,
	handlePossibleMembershipRole,
} from './events';
import { chooseRandom, happensWithAChanceOf } from './rng';
import { Command } from './commands/list';
import { IReactionDetails } from './types/reaction';

import dearViktor from '../data/global/dearviktor.json';
import {
	findCommandByKeyword,
	findReactionsById,
	findAllReactionsInMessage,
} from './storage/db';

// LOGIC

const isUserAdmin = (msg: Discord.Message): boolean =>
	msg.member.hasPermission('ADMINISTRATOR');
const isChannelDM = (msg: Discord.Message) => msg.author.id === msg.channel.id;
const isUserBot = (msg: Discord.Message) => msg.author.bot;
const isUserArcy = (msg: Discord.Message) =>
	msg.author.id === '165962236009906176';
const messageStartsWithCommandSymbol = async (msg: Discord.Message) => {
	const sym = await getCommandSymbol();
	return sym !== undefined && msg.content.startsWith(sym);
};

const isMessageRant = (msg: Discord.Message) =>
	msg.content === msg.content.toUpperCase() && msg.content.length > 20;
const isMessageDearViktor = (msg: Discord.Message) =>
	msg.content.toLowerCase().startsWith('dear viktor');
const isMessageDearVictor = (msg: Discord.Message) =>
	msg.content.toLowerCase().startsWith('dear victor');

const answer = (msg: Discord.Message, answer: string) =>
	msg.channel.send(answer);
const answerDearViktor = (msg: Discord.Message) => {
	if (msg.content.endsWith('?')) {
		const keywordDetected = dearViktor.keywords.find(
			(category: any) =>
				category.list.find((keyword: string) =>
					msg.content
						.toLowerCase()
						.includes(keyword),
				),
		);
		keywordDetected
			? answer(
					msg,
					chooseRandom(
						dearViktor.answers[
							keywordDetected.id
						],
					),
			  )
			: answer(msg, chooseRandom(dearViktor.answers.yesno));
		return;
	}
	answer(msg, "_That_ doesn't look like question to me.");
};
const answerDearVictor = (msg: Discord.Message) =>
	answer(
		msg,
		'...what have you just called me. <:SilentlyJudging:288396957922361344>',
	);
const answerCommand = async (msg: Discord.Message) => {
	const command = await findCommandByKeyword(getKeyword(msg));
	if (command === undefined) {
		await msg.react(':questionmark:244535324737273857');
		return;
	}

	if (command.text !== undefined) {
		new TextCommand(command, msg).execute(command.text);
		return;
	}

	if (command.embed !== undefined) {
		new EmbedCommand(command, msg).execute(
			command.embed,
			msg.author.username,
		);
		return;
	}
	if (Command[getKeyword(msg)]) {
		Command[getKeyword(msg)](command, msg);
		return;
	}

	await msg.react(':questionmark:244535324737273857');
};

const checkForReactionTriggers = async (msg: Discord.Message) => {
	const reactions = isMessageRant(msg)
		? await findReactionsById('rant')
		: await findAllReactionsInMessage(msg.content);
	if (reactions.length === 0) {
		return;
	}

	reactions.map(reaction => {
		const chosenReaction = reaction.reaction_list.find(
			(reaction: IReactionDetails) =>
				happensWithAChanceOf(reaction.chance),
		);
		if (chosenReaction) {
			chosenReaction.emoji && msg.react(chosenReaction.emoji);
			chosenReaction.response &&
				msg.channel.send(chosenReaction.response);
			chosenReaction.function &&
				Reaction[chosenReaction.function] &&
				Reaction[chosenReaction.function](msg);
		}
	});
};

// MAIN FUNCTION

const classifyMessage = async (msg: Discord.Message): Promise<void> => {
	if (isUserBot(msg)) {
		return;
	}
	if (isChannelDM(msg) && !isUserArcy(msg)) {
		answer(
			msg,
			'Only my glorious creator can talk to me in private.',
		);
		return;
	}

	await handleUserNotInDatabase(msg.member, msg);
	await handlePossibleMembershipRole(msg);

	if (isMessageDearViktor(msg)) {
		answerDearViktor(msg);
		return;
	}
	if (isMessageDearVictor(msg)) {
		answerDearVictor(msg);
		return;
	}
	if (await messageStartsWithCommandSymbol(msg)) {
		answerCommand(msg);
		return;
	}
	await checkForReactionTriggers(msg);
};

export { classifyMessage, isUserAdmin };
