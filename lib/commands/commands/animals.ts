import Discord from 'discord.js';
import axios from 'axios';

export const meow = async (msg:Discord.Message) => {
    const cat:any = await axios.get('http://aws.random.cat/meow')
        .catch(() => msg.channel.send('Unable to get a cat.'));
    msg.channel.send(`😺 ${cat.data.file}`);
}
export const woof = async (msg:Discord.Message) => {
    const dog:any = await axios.get('http://random.dog/woof')
        .catch(() => msg.channel.send('Unable to get a dog.'));;
    msg.channel.send(`🐶 http://random.dog/${dog.data}`);
}