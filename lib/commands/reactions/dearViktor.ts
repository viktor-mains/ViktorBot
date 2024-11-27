import Discord from 'discord.js';
import { chooseRandom } from '../../utils/rng';
import { answer } from 'utils/message';
import { getAllDearViktor } from 'storage/db';

export const answerDearViktor = async (msg: Discord.Message): Promise<void> => {
  if (!msg.content.endsWith("?")) {
    answer(msg, "_That_ doesn't look like question to me.");
    return;
  }

  const rawMessage = msg.content.toLowerCase()
  const dearViktor = await getAllDearViktor()

  const eligibleAnswers = dearViktor.filter(dv => {
    // Ignore generic answers in the first eligibility check
    return dv.id !== 'generic' && dv.triggers.some(trigger => rawMessage.includes(trigger))
  })

  if (eligibleAnswers.length > 0) {
    const randomAnswer = chooseRandom(eligibleAnswers[0].answers)
    answer(msg, randomAnswer)
  }
  else {
    const genericAnswers = dearViktor.find(dv => dv.id === 'generic').answers
    const randomAnswer = chooseRandom(genericAnswers)
    answer(msg, randomAnswer)
  }
};

export const answerDearVictor = (msg: Discord.Message): void => {
	answer(
		msg,
		'...what have you just called me. <:SilentlyJudging:288396957922361344>',
	);
}