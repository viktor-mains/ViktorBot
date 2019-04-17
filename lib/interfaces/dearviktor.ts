export interface IDVKeywords {
    id: string,
    list: [ string ]
}

export interface IDVAnswers {
    id: string,
    list: [ string ]
}

export interface IDearViktor {
    keywords: [ IDVKeywords ],
    answers: {
        noun: [ string ],
        verb: [ string ],
        yesno: [ string ],
        arcyanswers: [ string ],
        jayce: [ string ],
        evolution: [ string ]
    }
}