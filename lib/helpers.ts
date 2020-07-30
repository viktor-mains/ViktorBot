import Discord from 'discord.js';
import moment from 'moment';
import { IEmbedField } from './types/command';
import { findOption } from './storage/db';

export const getCommandSymbol = async (): Promise<string | undefined> =>
	await findOption('commandSymbol');

export const getKeyword = (msg: Discord.Message): string => {
	const argumentsPresent = msg.content.includes(' ');
	const keyword = argumentsPresent
		? msg.content.substring(1, msg.content.indexOf(' '))
		: msg.content.substring(1);
	return keyword.toLowerCase();
};

export const removeKeyword = (msg: Discord.Message): string => {
	if (msg.content.indexOf(' ') !== -1)
		return msg.content.substring(msg.content.indexOf(' ')).trim();
	return '';
};

export const hasSeparator = (msg: Discord.Message): boolean =>
	removeKeyword(msg).includes('|');

export const extractArguments = (msg: Discord.Message): string[] => {
	const args = removeKeyword(msg).trim().split('|');
	if (args.length === 1 && args[0] === '') return [];
	return args;
};

export const splitByFirstSymbol = (
	msg: Discord.Message,
	symbol: string,
): unknown[] => {
	const msgContent = removeKeyword(msg);
	if (msgContent.indexOf(symbol) === -1) return [msgContent];
	const args = [
		msgContent.substring(0, msgContent.indexOf(symbol)).trim(),
		msgContent.substring(msgContent.indexOf(symbol)).trim(),
	];
	return args;
};

export const createEmbed = (
	title: string,
	fields: Array<IEmbedField>,
	color?: string,
	thumbnail?: string,
	footer?: string,
): Discord.RichEmbed => {
	const embed = thumbnail
		? new Discord.RichEmbed()
				.setTitle(title)
				.setColor(color ? `0x${color}` : '0xFDC000')
				.setThumbnail(thumbnail)
				.setFooter(footer ? footer : '')
		: new Discord.RichEmbed()
				.setTitle(title)
				.setColor(color ? `0x${color}` : '0xFDC000')
				.setFooter(footer ? footer : '');
	fields.map(field =>
		embed.addField(
			field.title,
			field.content,
			field.inline ? field.inline : false,
		),
	);
	return embed;
};

export const isLink = (supposedLink: string): boolean => {
	if (supposedLink.startsWith('http')) return true;
	return false;
};

export const extractNicknameAndServer = (
	msg: Discord.Message,
): { nickname?: string; server?: string } => {
	if (!hasSeparator(msg)) {
		msg.channel.send(
			createEmbed('❌ Incorrect syntax', [
				{
					title: '___',
					content:
						'This command requires the symbol **|** to separate nickname from region.',
				},
			]),
		);
		return {};
	}
	const nicknameAndServer = removeKeyword(msg).split('|');
	let nickname: string | undefined = encodeURIComponent(
		nicknameAndServer[0].trim(),
	);
	let server: string | undefined = nicknameAndServer[1].trim();
	if (server.toLowerCase() === 'server') {
		msg.channel.send(
			createEmbed('❌ Incorrect syntax', [
				{
					title: '___',
					content:
						'``server`` means server like EUW or NA or TR, not _literally_ the word "server". <:vikfacepalm:355727809236434945>.',
				},
			]),
		);
		server = undefined;
	}
	if (nickname.toLowerCase() === 'ign') {
		msg.channel.send(
			createEmbed('❌ Incorrect syntax', [
				{
					title: '___',
					content:
						'``IGN`` means **I**n **G**ame **N**ame. Not _literally_ the word "IGN". <:vikfacepalm:355727809236434945>.',
				},
			]),
		);
		nickname = undefined;
	}
	return {
		nickname,
		server,
	};
};

export const splitArrayByObjectKey = (
	array: Array<any>,
	sortBy: string,
): Array<any> =>
	array.reduce((reducer: Array<any>, obj: any) => {
		const key = obj[sortBy];
		if (reducer[key] || (reducer[key] = [])) reducer[key].push(obj);
		return reducer;
	}, {});

export const toDDHHMMSS = (joinedAt: Date): string => {
	const start = moment(joinedAt);
	const end = moment();
	const diff = moment.duration(end.diff(start));

	return `${
		moment.duration(diff).years()
			? moment.duration(diff).years() + 'y '
			: ''
	}${
		moment.duration(diff).months()
			? moment.duration(diff).months() + 'm '
			: ''
	}${
		moment.duration(diff).days()
			? moment.duration(diff).days() + 'd '
			: ''
	}${
		moment.duration(diff).hours()
			? moment.duration(diff).hours() + 'h '
			: ''
	}${
		moment.duration(diff).minutes()
			? moment.duration(diff).minutes() + 'm '
			: ''
	}${
		moment.duration(diff).seconds()
			? moment.duration(diff).seconds() + 's '
			: ''
	}`;
};

export const toMMSS = (miliseconds: number): string => {
	const duration = miliseconds / 1000;
	const minutes = (duration / 60).toFixed(0);
	const seconds = (duration % 60).toFixed(0);
	return `${minutes} minutes ${seconds} seconds`;
};

export const justifyToRight = (
	input: string,
	desiredLength: number,
): string => {
	let output = input;
	while (output.length < desiredLength) output = ` ${output}`;
	return output;
};

export const justifyToLeft = (input: string, desiredLength: number): string => {
	let output = input;
	while (output.length < desiredLength) output += ` `;
	return output;
};

export const replaceAll = (stringToReplace: string): RegExp =>
	new RegExp(stringToReplace, 'gi');

export const modifyInput = (input: string): string =>
	encodeURIComponent(input.replace(replaceAll(' '), ''));
