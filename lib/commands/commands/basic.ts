import Discord from 'discord.js';
import { isUserAdmin } from '../../message';
import { chooseRandom } from '../../rng';
import {
	extractNicknameAndServer,
	createEmbed,
	getCommandSymbol,
	splitArrayByObjectKey,
} from '../../helpers';
import {
	findOption,
	findModCommands,
	Command,
	findUserCommands,
} from '../../storage/db';

type TField = {
	title: string;
	content: string;
};

export const opgg = (msg: Discord.Message): void => {
	const { nickname, server } = extractNicknameAndServer(msg);
	if (nickname && server)
		msg.channel.send(`https://${server}.op.gg/summoner/userName=${nickname}`);
};

export const help = async (msg: Discord.Message): Promise<void> => {
	const fields = new Array<TField>();
	const commandsAll = await findUserCommands();
	const commands = splitArrayByObjectKey(commandsAll, 'category');

	const sym = await getCommandSymbol()!;
	for (const category in commands) {
		const title = `Category ${category.toUpperCase()}`;
		let content = '';
		commands[category].map((command: Command) => {
			if (command.description)
				content += `- **${sym}${command.keyword}** - ${command.description}\n`;
		});
		if (content) fields.push({ title, content });
	}

	let embed;
	if (fields.length > 0) embed = createEmbed('📜 List of commands', fields);
	else
		embed = createEmbed('📜 List of commands', [
			{ title: '___', content: 'There is no commands!' },
		]);
	msg.author
		.send({ embed })
		.then(() => msg.react('📩'))
		.catch(() =>
			msg.channel.send(
				createEmbed(':warning: I am unable to reply to you', [
					{
						title: '___',
						content: `This command sends the reply to your DM, and it seems you have DMs from members of this server disabled.
            \nTo be able to receive messages from me, go to \`\`User Settings => Privacy & Safety => Allow direct messages from server members\`\` and then resend the command.`,
					},
				]),
			),
		);
};

export const hmod = async (msg: Discord.Message): Promise<void> => {
	const fields = new Array<TField>();
	const commandsAll = await findModCommands();
	const commands = splitArrayByObjectKey(commandsAll, 'category');

	const sym = await getCommandSymbol()!;
	for (const category in commands) {
		const title = `Category ${category.toUpperCase()}`;
		let content = '';
		commands[category].map((command: Command) => {
			if (command.description)
				content += `\`\`-\`\`**${sym}${command.keyword}** - ${command.description}\n`;
		});
		if (content) fields.push({ title, content });
	}

	let embed;
	if (fields.length > 0)
		embed = createEmbed('📜 List of moderator commands', fields);
	else
		embed = createEmbed('📜 List of commands', [
			{ title: '___', content: 'There is no moderator commands!' },
		]);

	msg.author
		.send({ embed })
		.then(() => msg.react('📩'))
		.catch(() =>
			msg.channel.send(
				createEmbed(':warning: I am unable to reply to you', [
					{
						title: '___',
						content: `This command sends the reply to your DM, and it seems you have DMs from members of this server disabled.
            \nTo be able to receive messages from me, go to \`\`User Settings => Privacy & Safety => Allow direct messages from server members\`\` and then resend the command.`,
					},
				]),
			),
		);
};

export const shutup = async (msg: Discord.Message): Promise<void> => {
	let answer = '';
	const option = isUserAdmin(msg) ? 'shutUpMod' : 'shutUpUser';
	const answers = (await findOption(option)) ?? [];
	answer = chooseRandom(answers);
	if (answer && answer !== '' && answer.length > 0) {
		msg.channel.send(answer);
	}
};
