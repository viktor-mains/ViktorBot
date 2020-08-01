import Discord from 'discord.js';
import {
	ICommand,
	IExecuteText,
	IExecuteCustom,
	IExecuteEmbed,
	IEmbed,
} from '../types/command';
import { botRefuses } from '../rng';
import { isUserAdmin } from '../message';
import { replaceAll } from '../helpers';
import { COLORS } from '../modules/colors';

class Command {
	public channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel;
	public canBeExecuted: boolean;
	private isDisabled: boolean;
	private isModOnly: boolean;
	private isProtected: boolean;
	private refusal: string;

	constructor(command: ICommand, msg: Discord.Message) {
		this.channel = msg.channel;
		this.isDisabled = command.isDisabled || false;
		this.isModOnly = command.isModOnly || false;
		this.isProtected = command.isProtected || true;
		this.refusal = command.refusal || 'Your commands tire me.';
		this.canBeExecuted = this._canBeExecuted(msg);
	}

	private _canBeExecuted(msg: Discord.Message) {
		if (this.isDisabled) {
			msg.react('🚧');
			return false;
		}
		if (this.isModOnly && !isUserAdmin(msg)) {
			msg.react('🚫');
			return false;
		}
		if (botRefuses()) {
			this.channel.send(this.refusal);
			return false;
		}
		return true;
	}
}

class Reaction {
	public channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel;

	constructor(msg: Discord.Message) {
		this.channel = msg.channel;
	}
}

export class TextCommand extends Command implements IExecuteText {
	public execute(content: string): void {
		this.canBeExecuted && this.channel.send(content);
	}
}
export class EmbedCommand extends Command implements IExecuteEmbed {
	public execute(embed: IEmbed, username: string): void {
		const { title, color, thumbnail, description } = embed;
		const newEmbed = new Discord.MessageEmbed()
			.setTitle(title)
			.setColor(color ? color : `0x${COLORS.embed.main}`)
			.setTimestamp(new Date())
			.setFooter(username);

		if (thumbnail) newEmbed.setThumbnail(thumbnail);
		if (description) newEmbed.setDescription(description);
		embed.fields.map(field =>
			newEmbed.addField(
				field.title,
				field.content.replace(replaceAll('<br>'), '\n'),
				field.inline,
			),
		);
		this.canBeExecuted && this.channel.send(newEmbed);
	}
}
export class CustomCommand extends Command implements IExecuteCustom {
	public execute(
		fn: (...args: unknown[]) => unknown,
		...args: Array<unknown>
	): void {
		this.canBeExecuted && fn(...args);
	}
}

export class TextReaction extends Reaction implements IExecuteText {
	public execute(content: string): void {
		this.channel.send(content);
	}
}
export class CustomReaction extends Reaction implements IExecuteCustom {
	public execute(
		fn: (...args: unknown[]) => unknown,
		...args: Array<unknown>
	): void {
		fn(...args);
	}
}
