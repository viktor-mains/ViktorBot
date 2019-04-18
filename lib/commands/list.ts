import Discord from 'discord.js';

import { ICommand } from '../types/command';
import { 
    TextCommand,
    EmbedCommand,
    CustomCommand,
} from './logic';

import { meow, woof } from './commands/animals';
import { rito } from './commands/simple_commands';


export const Command: { [key:string]: (command:ICommand, msg:Discord.Message) => string | void} = {
    test: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('This is a test.'),
    beep: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('_sighs deeply_\nBeep. Boop.'),
    runes: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('Aery.'),
    clubs: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('https://www.reddit.com/r/viktormains/wiki/clubs - the list of NA/EUW/EUNE in-game clubs we know about.'),
    faq: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('Useful tips and tricks for new Viktor players: https://www.reddit.com/r/viktormains/wiki/faq'),
    joke: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('I won\'t waste my precious time for the sake of your personal amusement.'),
    rito: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(rito, msg),
    gibeskin: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('http://arcyvilk.com/greatherald/img/gibeskin.png'),

    meow: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(meow, msg),
    woof: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(woof, msg),
};