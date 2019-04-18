export type ICommand = {
    keyword: string,
    description?: string,
    isProtected?: boolean,
    isDisabled?: boolean,
    isModOnly?: boolean,        
    refusal?: string
}
export type ICommandSettings = {
    commandSymbol: string,
    list: [ ICommand ]
}
export type IEmbedField = {
    title: string,
    content: string
}
export type IExecuteText = {
    execute: (content:string) => string | void;
}
export type IExecuteEmbed = {
    execute: (fields?: [ IEmbedField ]) => string | void;
}
export type IExecuteCustom = {
    execute: (fn:Function, ...args: any) => any;
}