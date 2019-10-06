import Discord from 'discord.js';

import { ICommand } from '../types/command';
import { 
    TextCommand,
    EmbedCommand,
    CustomCommand,
} from './logic';

import { help, hmod, opgg } from './commands/basic';
import { } from './commands/faq';
import { meow, woof, rito, choose } from './commands/fun';
import { status, impersonate } from './commands/mod';

export const Command: { [key:string]: (command:ICommand, msg:Discord.Message) => string | void} = {
    help: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(help, msg),
    hmod: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(hmod, msg),
    beep: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('_sighs deeply_\nBeep. Boop.'),
    clubs: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('List of in-game clubs we know about: <https://www.reddit.com/r/viktormains/wiki/clubs>'),
    faq: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('Useful tips and tricks for new Viktor players: <https://www.reddit.com/r/viktormains/wiki/faq>'),
    gibeskin: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('http://arcyvilk.com/greatherald/img/gibeskin.png'),
    joke: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('I won\'t waste my precious time for sake of your personal amusement.'),
    rito: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(rito, msg),
    status: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(status, msg),
    meow: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(meow, msg),
    woof: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(woof, msg),
    choose: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(choose, msg),
    opgg: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(opgg, msg),
    impersonate: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(impersonate, msg),
};