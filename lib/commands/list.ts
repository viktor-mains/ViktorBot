import Discord from 'discord.js';

import { ICommand } from '../types/command';
import { 
    TextCommand,
    EmbedCommand,
    CustomCommand,
} from './logic';

import { meow, woof } from './commands/animals';
import { rito } from './commands/simple_commands';
import { status } from './commands/administration';

export const Command: { [key:string]: (command:ICommand, msg:Discord.Message) => string | void} = {
    rito: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(rito, msg),
    status: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(status, msg),
    meow: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(meow, msg),
    woof: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(woof, msg),
};