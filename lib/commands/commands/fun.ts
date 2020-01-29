import Discord from 'discord.js';
import axios from 'axios';
import { removeKeyword } from '../../helpers';
import { chooseRandom } from '../../rng';

export const meow = async (msg:Discord.Message) => {
    msg.channel.startTyping();
    const cat:any = await axios('http://aws.random.cat/meow')
        .catch(() => msg.channel.send('Unable to get a cat.'));
    msg.channel.stopTyping();
    msg.channel.send(`😺 ${cat.data.file}`);
}
export const woof = async (msg:Discord.Message) => {
    msg.channel.startTyping();
    const dog:any = await axios('http://random.dog/woof')
        .catch(() => msg.channel.send('Unable to get a dog.'));;
    msg.channel.stopTyping();
    msg.channel.send(`🐶 http://random.dog/${dog.data}`);
}

export const choose = (msg:Discord.Message) => {
    const args = removeKeyword(msg);
    const argsArray = args.split('|');
    const randomThing = chooseRandom(argsArray).trim();

    return argsArray.length === 1
        ? msg.channel.send('...is that supposed to be a choice?')
        : msg.channel.send(`You should ${ randomThing }.`)
}

export const rito = (msg:Discord.Message) => {
    const rito = `
    :white_sun_small_cloud:
                  <:rito:323416307414335488>
                     |:open_hands:
                    / _
    ━━━━━┓ ＼＼
    ┓┓┓┓┓┃
    ┓┓┓┓┓┃ ヽ<:viktor:232941841815830536>ノ
    ┓┓┓┓┓┃      /
    ┓┓┓┓┓┃  ノ)
    ┓┓┓┓┓┃
    ┓┓┓┓┓┃
    `;
    msg.channel.send(rito);
}
