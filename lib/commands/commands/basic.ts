import Discord from 'discord.js';
import { cache } from '../../storage/cache';
import { extractNicknameAndServer, createEmbed, getCommandSymbol, splitArrayByObjectKey, } from '../../helpers';

type TField = {
    title: string,
    content: string
}

export const opgg = (msg:Discord.Message) => {
    const { nickname, server } = extractNicknameAndServer(msg);
    if (nickname && server)
        msg.channel.send(`https://${ server }.op.gg/summoner/userName=${ nickname }`)
}

export const help = (msg:Discord.Message) => {
    msg.channel.startTyping();
    let fields = new Array<TField>();
    let commands = cache["commands"]
        .filter(command => command.isModOnly === false && command.description);
    commands = splitArrayByObjectKey(commands, 'category');

    for (let category in commands) {
        const title = `Category ${category.toUpperCase()}`;
        let content = '';
        commands[category].map(command => content += `\`\`-\`\`**${getCommandSymbol()}${command.keyword}** - ${command.description}\n`);
        fields.push({ title, content })
    }
        
    const embed = createEmbed('📜 List of commands', fields);
    msg.channel.stopTyping();
    msg.channel.send(embed);
}

export const hmod = (msg:Discord.Message) => {
    msg.channel.startTyping();
    let fields = new Array<TField>();
    let commands = cache["commands"]
        .filter(command => command.isModOnly === true && command.description);
    commands = splitArrayByObjectKey(commands, 'category');

    for (let category in commands) {
        const title = `Category ${category.toUpperCase()}`;
        let content = '';
        commands[category].map(command => content += `\`\`-\`\`**${getCommandSymbol()}${command.keyword}** - ${command.description}\n`);
        fields.push({ title, content })
    }
        
    const embed = createEmbed('📜 List of moderator commands', fields);
    msg.channel.stopTyping();
    msg.channel.send(embed);
}
