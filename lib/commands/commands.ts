import Discord from 'discord.js';
import axios from 'axios';

import { ICommand } from '../types/command';
import { 
    TextCommand,
    EmbedCommand,
    CustomCommand,
} from './main';

export const Command: { [key:string]: (command:ICommand, msg:Discord.Message) => string | void} = {
    meow: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(meow, msg),
    woof: (command:ICommand, msg:Discord.Message) => new CustomCommand(command, msg).execute(woof, msg),
};

const meow = async (msg:Discord.Message) => {
    const cat:any = await axios.get('http://aws.random.cat/meow');
    msg.channel.send(`😺 ${cat.data.file}`);
}
const woof = async (msg:Discord.Message) => {
    const dog:any = await axios.get('http://random.dog/woof');
    msg.channel.send(`🐶 http://random.dog/${dog.data}`);
}