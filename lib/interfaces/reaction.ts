export interface IReactionDetails {
    chance: number,
    emoji: string
}

export interface IReaction {
    id?: string,
    keyword?: string,
    list: [ IReactionDetails ]
}