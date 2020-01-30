import Discord from 'discord.js';
import axios from 'axios';
import { removeKeyword, toDDHHMMSS } from '../../helpers';
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
export const gibeskin = (msg:Discord.Message) => {
    const creatorDate = 1380499200000;
    const deathSwornDate = 1508889600000;

    const embed = new Discord.RichEmbed()
        .setTitle('Viktor skin')
        .setTimestamp(new Date())
        .setFooter('Powered by Glorious Evolution', 'https://cdn.discordapp.com/emojis/232941841815830536.png')
        .setColor('0xFDC000')
        .setDescription(`Today's date is ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()} and here are some facts about Viktor...`)
        .addField('\_\_\_', `...we have 4 skins, two of which (Prototype and Death Sworn) are legacy.\n
        His last skin is Death Sworn, which was released at ${new Date(deathSwornDate).toLocaleDateString()}. That's **${toDDHHMMSS(new Date(deathSwornDate))}** ago.\n
        Since some of us pretend that skin didn't happen, let's assume that his last skin was Creator. It was released at ${new Date(creatorDate).toLocaleDateString()}, what would make it fucking **${toDDHHMMSS(new Date(creatorDate))}** without a decent skin.\n
        After being presented by those facts, you can do \`\`!rito\`\` command now and weep with other Viktor Mains in a corner covered in dust and spiderwebs because no one fucking remembers about us anymore <:salt:289489052212789250>
    `)

    msg.channel.send(embed);
}