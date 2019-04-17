import Discord from 'discord.js';
import { ICommand } from '../types/command';
import { 
    TextCommand,
    EmbedCommand,
    CustomCommand,
} from './main';

export const Command: { [key:string]: (command:ICommand, msg:Discord.Message) => string | void} = {
    testtext: (command:ICommand, msg:Discord.Message) => new TextCommand(command, msg).execute('This is a test.'),
    testcustom: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(testCustom),
    testembed: (command:ICommand, msg:Discord.Message) => new EmbedCommand(command, msg).execute([{ 'title': 'Title', 'content': 'Content' }]),
};

const testCustom = () => console.log('I work!!');
