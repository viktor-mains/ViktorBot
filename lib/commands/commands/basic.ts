import Discord from "discord.js";
import { extractNicknameAndServer } from '../../helpers';

export const opgg = (msg:Discord.Message) => {
    const { nickname, server } = extractNicknameAndServer(msg);
    if (nickname && server)
        msg.channel.send(`https://${ server }.op.gg/summoner/userName=${ nickname }`)
}

export const help = (msg:Discord.Message) => {
    
}