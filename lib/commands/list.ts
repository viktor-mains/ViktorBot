import Discord from 'discord.js';

import { ICommand } from '../types/command';
import { 
    TextCommand,
    EmbedCommand,
    CustomCommand,
} from './logic';

import { help, hmod, opgg } from './commands/basic';
import { register, profile, description } from './commands/profiles';
import { } from './commands/faq';
import { meow, woof, rito, choose } from './commands/fun';
import { status, impersonate, refresh } from './commands/mod';
import { updatechampions, lastlane } from './commands/riot';
import { iam, iamnot, roles, membership, topmembers } from './commands/roles';

export const Command: { [key:string]: (command:ICommand, msg:Discord.Message) => string | void} = {
    help: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(help, msg),
    hmod: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(hmod, msg),
    opgg: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(opgg, msg),
    
    register: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(register, msg),
    profile: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(profile, msg),
    description: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(description, msg),

    meow: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(meow, msg),
    woof: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(woof, msg),
    rito: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(rito, msg),
    choose: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(choose, msg),
    beep: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('_sighs deeply_\nBeep. Boop.'),
    clubs: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('List of in-game clubs we know about: <https://www.reddit.com/r/viktormains/wiki/clubs>'),
    faq: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('Useful tips and tricks for new Viktor players: <https://www.reddit.com/r/viktormains/wiki/faq>'),
    joke: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('I won\'t waste my precious time for sake of your personal amusement.'),
    gibeskin: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('http://arcyvilk.com/greatherald/img/gibeskin.png'),
    
    status: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(status, msg),
    impersonate: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(impersonate, msg),
    refresh: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(refresh, msg),    
    
    updatechampions: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(updatechampions, msg),
    lastlane: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(lastlane, msg),

    iam: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(iam, msg),
    iamnot: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(iamnot, msg),
    roles: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(roles, msg),
    membership: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(membership, msg),
    topmembers: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(topmembers, msg),
};