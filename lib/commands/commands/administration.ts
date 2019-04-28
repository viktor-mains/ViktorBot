import Discord from 'discord.js';
import { removeKeyword } from '../../helpers';
import { cache } from '../../../cache';

// @ts-ignore
export const status = async (msg:Discord.Message) => cache.bot.user.setPresence({ game: { name: removeKeyword(msg), type: 0}})