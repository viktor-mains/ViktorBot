import Discord from 'discord.js';

import { ICommand } from '../types/command';
import { /* TextCommand, EmbedCommand, */ CustomCommand } from './logic';

import { help, hmod, opgg, shutup } from './commands/basic';
import {
	profile,
	description,
	update,
	topmembers,
	register,
	unregister,
} from './commands/profiles';
import { meow, woof, rito, choose, gibeskin, degen } from './commands/fun';
import {
	status,
	impersonate,
	punish,
	msgupdate,
	guilds,
	ismember,
} from './commands/mod';
import { updatechampions, lastlane, mastery } from './commands/riot';
import { iam, iamnot, roles } from './commands/roles';

export const Command: {
	[key: string]: (
		command: ICommand,
		msg: Discord.Message,
	) => string | void;
} = {
	help: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(help, msg),
	h: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(help, msg),
	hmod: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(hmod, msg),
	opgg: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(opgg, msg),
	shutup: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(shutup, msg),

	profile: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(profile, msg),
	description: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(description, msg),
	update: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(update, msg),
	topmembers: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(topmembers, msg),
	register: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(register, msg),
	unregister: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(unregister, msg),

	meow: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(meow, msg),
	woof: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(woof, msg),
	rito: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(rito, msg),
	choose: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(choose, msg),
	gibeskin: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(gibeskin, msg),
	degen: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(degen, msg),

	status: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(status, msg),
	impersonate: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(impersonate, msg),
	punish: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(punish, msg),
	msgupdate: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(msgupdate, msg),
	guilds: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(guilds, msg),
	ismember: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(ismember, msg),

	updatechampions: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(updatechampions, msg),
	lastlane: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(lastlane, msg),
	mastery: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(mastery, msg),

	iam: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(iam, msg),
	iamnot: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(iamnot, msg),
	roles: (command: ICommand, msg: Discord.Message) =>
		new CustomCommand(command, msg).execute(roles, msg),
};
