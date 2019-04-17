require('babel-register')({
    presets: [ 'env' ],
    extensions: ['.js', '.jsx', '.ts', '.tsx']
})
module.exports = require('./viktor.js')
