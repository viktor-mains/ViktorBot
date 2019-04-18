import Discord from 'discord.js';

export const getKeyword = (msg:Discord.Message) => {
    const argumentsPresent = msg.content.indexOf(' ') !== -1;
    const keyword = argumentsPresent
        ? msg.content.substring(1, msg.content.indexOf(' '))
        : msg.content.substring(1);
    return keyword.toLowerCase();
};

export const removeKeyword = (msg:Discord.Message) => msg.content.substring(msg.content.indexOf(' '));