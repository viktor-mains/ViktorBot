import Discord from 'discord.js';
import { IEmbedField } from './types/command';
import { cache } from './storage/cache';

export const getCommandSymbol = () => cache["options"].find(option => option.option === 'commandSymbol').value;

export const getKeyword = (msg:Discord.Message) => {
    const argumentsPresent = msg.content.includes(' ');
    const keyword = argumentsPresent
        ? msg.content.substring(1, msg.content.indexOf(' '))
        : msg.content.substring(1);
    return keyword.toLowerCase();
};

export const removeKeyword = (msg:Discord.Message) => {
    if (msg.content.indexOf(' ') !== -1)
        return msg.content.substring(msg.content.indexOf(' ')).trim();
    return '';
}

export const hasSeparator = (msg:Discord.Message) => 
    removeKeyword(msg).includes('|');

export const extractArguments = (msg:Discord.Message) => {
    const args = removeKeyword(msg).trim().split(' ');
    if (args.length === 1 && args[0] === '')
        return [];
    return args;
}

export const splitByFirstSymbol = (msg:Discord.Message, symbol:string) => {
    const msgContent = removeKeyword(msg);
    const args = new Array;
    if (msgContent.indexOf(symbol) === -1)
        return [ msgContent ];
    args[0] = msgContent.substring(0, msgContent.indexOf(symbol)).trim();
    args[1] = msgContent.substring(msgContent.indexOf(symbol)).trim();
    return args;
}

export const createEmbed = (title: string, fields:Array<IEmbedField>, color?: string, thumbnail?: string, footer?: string) => {
    const embed = thumbnail
        ? new Discord.RichEmbed()
            .setTitle(title)
            .setColor(color ? `0x${color}` : '0xFDC000')
            .setThumbnail(thumbnail)
            .setFooter(footer ? footer : '')
        : new Discord.RichEmbed()
            .setTitle(title)
            .setColor(color ? `0x${color}` : '0xFDC000')
            .setFooter(footer ? footer : '');
    fields.map(field => embed.addField(field.title, field.content, field.inline ? field.inline : false));
    return embed;
}

export const isLink = (supposedLink:string) => {
    if (supposedLink.startsWith('http'))
        return true;
    return false;
};

export const extractNicknameAndServer = (msg:Discord.Message) => {
    if (!hasSeparator(msg)) {
        msg.channel.send('This command requires the symbol **|** to separate region from nickname.');
        return {};
    }
    const nicknameAndServer = removeKeyword(msg).split('|');
    const nickname = encodeURIComponent(nicknameAndServer[0].trim());
    const server = nicknameAndServer[1].trim();
    return {
        nickname,
        server
    }
}

export const splitArrayByObjectKey = (array:Array<Object>, sortBy:string) =>
    array.reduce((reducer, obj) => {
        let key = obj[sortBy]; 
        if (reducer[key] || (reducer[key]=[])) 
            reducer[key].push(obj);
        return reducer;
    }, {});
