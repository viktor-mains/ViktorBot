exports.serverToEndPoint = function(server) {
  switch (server.toLowerCase()) {
    case "br":
      return "br1"
    case "eune":
      return "eun1"
    case "euw":
      return "euw1"
    case "jp":
      return "jp1"
    case "kr":
      return "kr"
    case "lan":
      return "la1"
    case "las":
      return "la2"
    case "na":
      return "na1"
    case "oce":
      return "oc1"
    case "tr":
      return "tr1"
    case "ru":
      return "ru"
    case "pbe":
      return "pbe1"
    default:
      return 0
  }
}

exports.spellIDToSpellIcon = function(spellID) {
  switch (spellID) {
    case 1:
      return `<:Cleanse:315829639941455872>`
    case 13:
      return `<:Clarity:315829639400652801>`
    case 21:
      return `<:Barrier:315829639589265408>`
    case 7:
      return `<:Heal:315829640537047040>`
    case 14:
      return `<:Ignite:315829640641904650>`
    case 4:
      return `<:Flash:315829640302166016>`
    case 12:
      return `<:Teleport:315829641057402880>`
    case 32:
      return `<:Mark:315829640784510976>`
    case 11:
      return `<:Smite:315829640583315457>`
    case 6:
      return `<:Ghost:315829640340176896>`
    case 3:
      return `<:Exhaust:315829639652179970>`
    default:
      return `❓`
  }
}

exports.gameModeIDToName = function(gameModeID) {
  switch (gameModeID) {
    case 0:
      return " - Custom game"
    case 8:
      return " - Normal Twisted Treeline"
    case 2:
      return " - Normal Blind Pick 5v5"
    case 14:
      return " - Normal Draft Pick 5v5"
    case 4:
      return " - Ranked Solo 5v5"
    case 42:
      return " - Ranked Team 5v5"
    case 31:
      return " - Coop vs AI Intro Bots"
    case 32:
      return " - Coop vs AI Beginner Bots"
    case 33:
      return " - Coop vs AI Intermediate Bots"
    case 400:
      return " - Normal Draft Pick 5v5"
    case 410:
      return " - Ranked Draft Pick 5v5"
    case 420:
      return " - Ranked Solo/Duo 5v5"
    case 440:
      return " - Ranked Flex 5v5"
    case 52:
      return " - Coop vs AI Twisted Treeline"
    default:
      return ""
  }
}

exports.romanToArabic = function(number) {
  if (number == "I") return 1
  else if (number == "II") return 2
  else if (number == "III") return 3
  else if (number == "IV") return 4
  else if (number == "V") return 5
  else return 0
}

exports.arabicToRoman = function(number) {
  if (number == 1) return `I`
  else if (number == 2) return `II`
  else if (number == 3) return `III`
  else if (number == 4) return `IV`
  else if (number == 5) return `V`
  else return 0
}

exports.numberToNumberEmoji = function(number) {
  switch (number) {
    case 1:
      return ":one:"
    case 2:
      return ":two:"
    case 3:
      return ":three:"
    case 4:
      return ":four:"
    case 5:
      return ":five:"
    case 6:
      return ":six:"
    case 7:
      return ":seven:"
    case 8:
      return ":eight:"
    case 9:
      return ":nine:"
    case 0:
      return ":zero:"
    default:
      return "?"
  }
}
