export type IReactionDetails = {
    chance: number,
    emoji: string
}

export type IReaction = {
    id?: string,
    keyword?: string,
    list: [ IReactionDetails ]
}