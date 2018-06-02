exports.isLink = function(supposedLink) {
  if (supposedLink.startsWith(`http`)) return true
  return false
}

exports.hasSeparator = function(_input) {
  if (_input.indexOf("|") != -1) return true
  return false
}

exports.allKeywordsWereFoundInString = function(keywords, _input) {
  _input = _input.toLowerCase()
  for (var i = 0; i < keywords.length; i++) {
    if (_input.indexOf(keywords[i]) == -1) return false
  }
  return true
}

exports.removeOneSymbolPrefix = function(_input) {
  var output = _input.slice(1).trim()
  return output
}

exports.removeKeyword = function(_input) {
  var output = ``
  if (_input.indexOf(` `) != -1)
    output = _input.slice(_input.indexOf(` `)).trim()
  return output
}

exports.extractKeyword = function(_input) {
  var output = _input.slice(1).trim()
  if (output.indexOf(" ") !== -1)
    output = output.slice(0, output.indexOf(" ")).trim()
  output = output.toLowerCase()
  return output
}

exports.subStringBySymbol = function(_input, symbol) {
  var first = _input.substring(0, _input.indexOf(symbol)).trim()
  var second = _input.substring(_input.indexOf(symbol)).trim()
  return [first, second]
}

exports.removeSpaces = function(_input) {
  var output = _input.toLowerCase()
  output = output.replace(/ /g, ``)
  return output
}

exports.returnModifiedIGNAndServer = function(_input) {
  // HACK: Referring to 'exports' in this way is generally considered a bad idea
  return exports.getIGNAndServer(
    exports.getRidOfSpecialSymbols(
      exports.removeSpaces(exports.removeKeyword(_input))
    )
  )
}

exports.getIDOfMentionedPerson = function(_input) {
  var output = exports.removeKeyword(_input)
  output = output.substring(2, output.length - 1)
  return output
}

exports.getIGNAndServer = function(_input) {
  var output = _input.split(`%7C`)
  return output
}

exports.getRidOfSpecialSymbols = function(_input) {
  return encodeURIComponent(_input)
}

exports.readdSpecialSymbols = function(_input) {
  return decodeURIComponent(_input)
}

exports.justifyToRight = function(_input, desiredLength) {
  var output = _input
  while (output.length < desiredLength) output = ` ${output}`
  return output
}

exports.justifyToLeft = function(_input, desiredLength) {
  var output = _input
  while (output.length < desiredLength) output += ` `
  return output
}

exports.round = function(number, digits) {
  var multiple = Math.pow(10, digits)
  var output = Math.round(number * multiple) / multiple
  return output
}

exports.convertMinutesToHoursAndMinutes = function(minutes) {
  var h = Math.floor(minutes / 60)
  var m = minutes % 60
  h = h < 10 ? "0" + h : h
  m = m < 10 ? "0" + m : m
  return h + ":" + m
}
