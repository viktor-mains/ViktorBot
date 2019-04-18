import Discord from 'discord.js';

import { removeKeyword } from '../../helpers';
import { chooseRandom } from '../../rng';

export const choose = (msg:Discord.Message) => {
    const args = removeKeyword(msg);
    const argsArray = args.split('|');
    const randomThing = chooseRandom(argsArray).trim();

    return argsArray.length === 1
        ? msg.channel.send('...is that supposed to be a choice?')
        : msg.channel.send(`You should ${ randomThing }.`)
}