import Discord from 'discord.js';

type IBotCache = {
    bot?: Discord.Client,
    dbs?: { },
}

let botCache:IBotCache = {
    bot: undefined,
    dbs: { },
};

class BotCache {
    constructor() {
        if (botCache)
            return botCache;
        botCache = this;

        return botCache;
    }
}

export let cache = new BotCache();