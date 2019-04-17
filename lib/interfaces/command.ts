export interface ICommand  {
    keyword: string,
    description?: string,
    isProtected?: boolean,
    isDisabled?: boolean,
    isModCommand?: boolean,        
    refusal?: string
}

export interface ICommandSettings {
    commandSymbol: string,
    list: [ ICommand ]
}