import Discord from 'discord.js';
import axios from 'axios';
import { uniq } from 'lodash';
import emojiRegex from 'emoji-regex/es2015/index.js';
import emojiRegexText from 'emoji-regex/es2015/text.js';
import { removeKeyword, toDDHHMMSS, createEmbed } from '../../helpers';
import { chooseRandom } from '../../rng';
import { log } from '../../log';
import { cache } from '../../storage/cache';

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
        .setTitle('<:vikSalty:289489052212789250> Viktor skin')
        .setTimestamp(new Date())
        .setFooter('Powered by Glorious Evolution', 'https://cdn.discordapp.com/emojis/232941841815830536.png')
        .setColor('0xFDC000')
        .addField(`**Today's date is ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()} and here are some facts about Viktor's skins**`, 
        `We have **4** skins, two of which (Prototype and Death Sworn) are legacy.\n\n`+
        `His last skin is Death Sworn, which was released at ${new Date(deathSwornDate).toLocaleDateString()}. That's **${toDDHHMMSS(new Date(deathSwornDate))}** ago.\n\n`+
        `Since some of us pretend that skin didn't happen, and also it's legacy for whatever reason, let's assume that his last skin was Creator. It was released at ${new Date(creatorDate).toLocaleDateString()}, what would make it exactly **${toDDHHMMSS(new Date(creatorDate))}** without a decent skin.\n\n`+
        `After being presented with those facts, you can do \`\`!rito\`\` command now and weep with other Viktor Mains in a corner covered in dust and spiderwebs.`
    )

    msg.channel.send(embed);
}
export const degen = async (msg:Discord.Message) => {
    msg.channel.startTyping();
    const words = cache["options"].find(option => option.option === 'degen_words')
        ? cache["options"].find(option => option.option === 'degen_words').value
        : [];
    const degeneracyPercentageDefault = 70;
    const limit = 20;
    const emojiMultiplier = 3;
    const regex = emojiRegex();
    const regexText = emojiRegexText();
    msg.channel.fetchMessages({ limit })
        .then(messages => {
            const allWords:Array<string> = []; 
            const degenMsgs = messages.filter(m => 
                words.find(word => m.content.toLowerCase().split(' ').includes(word.toLowerCase()))
                || regex.exec(m.content)
                || regexText.exec(m.content)
                || (m.content.startsWith(':') && m.content.endsWith(':')) // probably emoji
                || m.content === m.content.toUpperCase() // all caps
                || regex.exec(m.content) // emoji spam
                || regexText.exec(m.content) // emoji spam
                || m.content.startsWith('!') // command spam
            )   
            messages.map(m => allWords.push(...m.content.toLowerCase().trim().split(' ')));
            const emojiSpam = allWords.filter(word => regex.exec(word) || regexText.exec(word)).length;
            const uniqMsgs = uniq(messages.map(m => m.content));
            const percentageGeneralSpam = 100 - (100 * uniqMsgs.length/messages.size);
            const percentageDegenWords = 100 * degenMsgs.size / limit;
            const percentageEmojiSpam = emojiSpam * emojiMultiplier;
            const percentageShortMessages = 0.5 * limit * degeneracyPercentageDefault/allWords.length;
            const percentage = percentageDegenWords + percentageEmojiSpam + percentageShortMessages + percentageGeneralSpam;
            const embed = new Discord.RichEmbed()
                .setTitle('☢️ Degeneracy of the chat')
                .setFooter(`Powered by Glorious Evolution`, 'https://cdn.discordapp.com/emojis/288396957922361344.png')
                .setTimestamp(new Date())
                .setColor('0xFDC000')
            embed.addField('\_\_\_', 
                `My precise calculations and sophisticated algorithms led me to a conclusion that the degeneracy percentage of this chat has reached **${percentage.toFixed(4)}%**.\n\n`+
                `- general spam - **${percentageGeneralSpam.toFixed(4)}%**\n`+
                `- short message spam - **${percentageShortMessages.toFixed(4)}%**\n`+
                `- emoji spam - **${percentageEmojiSpam.toFixed(4)}%**\n`+
                `- overall degeneracy - **${percentageDegenWords.toFixed(4)}%**`
            )
            msg.channel.send(embed);
            msg.channel.stopTyping();
        })
        .catch(err => {
            log.WARN(err);
            msg.channel.send(createEmbed('❌ Cannot calculate chat\'s degeneracy', [{ title: '\_\_\_', content: 'Probably it went over the limits.' }]));
            msg.channel.stopTyping();
            return;
        })
}