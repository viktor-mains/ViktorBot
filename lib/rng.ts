const chanceToRefuse = 1;
const bottomRange = 1;
const hundred = 100;

export const draw = (): number =>
	Math.floor(Math.random() * hundred + bottomRange);
export const botRefuses = (): boolean => happensWithAChanceOf(chanceToRefuse);
export const happensWithAChanceOf = (percentageChance: number): boolean =>
	draw() <= percentageChance ? true : false;
/* eslint-disable-next-line */
export const chooseRandom = (list: Array<any>): any =>
	list[Math.floor(Math.random() * list.length)];
