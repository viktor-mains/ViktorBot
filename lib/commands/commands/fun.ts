import Discord from 'discord.js';
import axios, { AxiosResponse } from 'axios';
import { uniq } from 'lodash';
import emojiRegex from 'emoji-regex/es2015/index.js';
import emojiRegexText from 'emoji-regex/es2015/text.js';
import { removeKeyword, toDDHHMMSS, createEmbed } from '../../helpers';
import { chooseRandom } from '../../rng';
import { log } from '../../log';
import BotGraph from '../../graphs';
import { findOption } from '../../storage/db';
import { COLORS } from '@modules/colors';
import * as Config from '../../config';

export const meow = async (msg: Discord.Message): Promise<void> => {
	msg.channel.startTyping();
	const token = Config.get('CAT_API_TOKEN');
	const cat: void | AxiosResponse = await axios(
		`https://api.thecatapi.com/v1/images/search?api_key=${token}`,
	).catch(() => {
		msg.channel.send('Unable to get a cat.');
		msg.channel.stopTyping();
		return;
	});
	if (!cat || !cat.data) {
		msg.channel.send('Unable to get a cat.');
		return;
	}
	const embed = new Discord.MessageEmbed()
		.setTitle('😺 Cat!')
		.setTimestamp(new Date())
		.setFooter(msg.author.username)
		.setColor(`0x${COLORS.embed.main}`)
		.setImage(cat.data[0].url);
	msg.channel.stopTyping();
	msg.channel.send(embed);
};

export const woof = async (msg: Discord.Message): Promise<void> => {
	msg.channel.startTyping();
	const dog: void | AxiosResponse = await axios('http://random.dog/woof').catch(
		() => {
			msg.channel.send('Unable to get a dog.');
			msg.channel.stopTyping();
			return;
		},
	);
	if (!dog || !dog.data) {
		msg.channel.send('Unable to get a dog.');
		return;
	}
	const embed = new Discord.MessageEmbed()
		.setTitle('🐶 Dog!')
		.setTimestamp(new Date())
		.setFooter(msg.author.username)
		.setColor(`0x${COLORS.embed.main}`)
		.setImage(`http://random.dog/${dog.data}`);
	msg.channel.stopTyping();
	msg.channel.send(embed);
};

export const choose = (msg: Discord.Message): void => {
	const args = removeKeyword(msg);
	const argsArray = args.split('|');
	const randomThing = chooseRandom(argsArray).trim();

	argsArray.length === 1
		? msg.channel.send('...is that supposed to be a choice?')
		: msg.channel.send(`You should ${randomThing}.`);
};

export const rito = (msg: Discord.Message): void => {
	const rito = `
    :white_sun_small_cloud:
                  <:rito:323416307414335488>
                     |:open_hands:
                    / _
    ━━━━━┓ ＼＼
    ┓┓┓┓┓┃
    ┓┓┓┓┓┃ ヽ<:viktor:232941841815830536>ノ
    ┓┓┓┓┓┃      /
    ┓┓┓┓┓┃  ノ)
    ┓┓┓┓┓┃
    ┓┓┓┓┓┃
    `;
	msg.channel.send(rito);
};
export const gibeskin = async (msg: Discord.Message): Promise<void> => {
	const opt = await findOption('gibeskin');
	const skins = opt ?? [
		{
			key: 'Creator',
			value: 1380499200000,
			viktor: true,
		},
		{
			key: 'Death Sworn',
			value: 1508889600000,
			viktor: true,
		},
	];

	const creatorDate = skins.find(skin => skin.key === 'Creator')!.value;
	const deathSwornDate = skins.find(skin => skin.key === 'Death Sworn')!.value;
	const graph = new BotGraph({ width: 500, height: 300 });
	const graphAttachment: Discord.MessageAttachment = await graph.generate(
		skins,
	);
	const embed = new Discord.MessageEmbed()
		.setTitle('<:vikSalty:289489052212789250> Viktor skin')
		.setTimestamp(new Date())
		.setFooter(
			'Powered by Glorious Evolution',
			'https://cdn.discordapp.com/emojis/232941841815830536.png',
		)
		.setColor(`0x${COLORS.embed.main}`)
		.attachFiles([graphAttachment])
		.setImage('attachment://graph.png')
		.addField(
			`\_\_\_`,
			`We have **4** skins, two of which (Prototype and Death Sworn) are legacy.\n\n` +
				`His last skin is Death Sworn, which was released at ${new Date(
					deathSwornDate,
				).toLocaleDateString()}. That's **${toDDHHMMSS(
					new Date(deathSwornDate),
				)}** ago.\n\n` +
				`Since some of us pretend that skin didn't happen, and also it's legacy for whatever reason, let's assume that his last skin was Creator. It was released at ${new Date(
					creatorDate,
				).toLocaleDateString()}, what would make it exactly **${toDDHHMMSS(
					new Date(creatorDate),
				)}** without a decent skin.\n\n` +
				`And now have a nice graph comparing that with some Riot's poster children:`,
		);
	msg.channel.send(embed);
};

export const degen = async (msg: Discord.Message): Promise<void> => {
	msg.channel.startTyping();
	const words = (await findOption('degenWords')) ?? [];
	const degeneracyPercentageDefault = 70;
	const limit = 30;
	const emojiMultiplier = 3;
	const regex = emojiRegex();
	const regexText = emojiRegexText();
	msg.channel.messages
		.fetch({ limit })
		.then(messages => {
			const allWords: Array<string> = [];
			const degenMsgs = messages.filter(
				m =>
					words.find(word =>
						m.content.toLowerCase().split(' ').includes(word.toLowerCase()),
					) ||
					regex.exec(m.content) ||
					regexText.exec(m.content) ||
					// probably emoji
					(m.content.startsWith(':') && m.content.endsWith(':')) ||
					// caps spam
					m.content === m.content.toUpperCase() ||
					// emoji spam
					regex.exec(m.content) ||
					// emoji spam
					regexText.exec(m.content) ||
					// command spam
					m.content.startsWith('!'),
			);
			messages.map(m =>
				allWords.push(...m.content.toLowerCase().trim().split(' ')),
			);
			const oneHundred = 100;
			const half = 0.5;
			const emojiSpam = allWords.filter(
				word => regex.exec(word) || regexText.exec(word),
			).length;
			const uniqMsgs = uniq(messages.map(m => m.content));
			const percentageGeneralSpam =
				oneHundred - (oneHundred * uniqMsgs.length) / messages.size;
			const percentageDegenWords = (oneHundred * degenMsgs.size) / limit;
			const percentageEmojiSpam =
				(oneHundred * (emojiSpam * emojiMultiplier)) / allWords.length;
			const percentageShortMessages =
				(half * limit * degeneracyPercentageDefault) / allWords.length;
			const percentage =
				percentageDegenWords +
				percentageEmojiSpam +
				percentageShortMessages +
				percentageGeneralSpam;
			const embed = new Discord.MessageEmbed()
				.setTitle('☢️ Degeneracy of the chat')
				.setFooter(
					`Powered by Glorious Evolution`,
					'https://cdn.discordapp.com/emojis/288396957922361344.png',
				)
				.setTimestamp(new Date())
				.setColor(`0x${COLORS.embed.main}`);
			embed.addField(
				'___',
				`My precise calculations and sophisticated algorithms led me to a conclusion that the degeneracy percentage of this chat has reached **${percentage.toFixed(
					2,
				)}%**.\n\n` +
					`- general spam - **${percentageGeneralSpam.toFixed(2)}%**\n` +
					`- short message spam - **${percentageShortMessages.toFixed(
						2,
					)}%**\n` +
					`- emoji spam - **${percentageEmojiSpam.toFixed(2)}%**\n` +
					`- overall degeneracy - **${percentageDegenWords.toFixed(2)}%**`,
			);
			msg.channel.send(embed);
			msg.channel.stopTyping();
		})
		.catch(err => {
			log.WARN(err);
			msg.channel.send(
				createEmbed("❌ Cannot calculate chat's degeneracy", [
					{
						title: '___',
						content: 'Probably it went over the limits.',
					},
				]),
			);
			msg.channel.stopTyping();
			return;
		});
};
