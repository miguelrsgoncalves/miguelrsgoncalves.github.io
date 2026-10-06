const fs = require('node:fs')

function route(route) {
    const html = fs.readFileSync(route.source, 'utf-8')
}

module.exports = { route }