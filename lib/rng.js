export const happensWithAChanceOf = percentageChance => {
    const drawnNumber = Math.floor((Math.random() * 100) + 1);
    return drawnNumber <= percentageChance
        ? true
        : false
};
export const botRefuses = () => happensWithAChanceOf(1);
export const chooseRandom = list => list[Math.floor(Math.random() * list.length)];