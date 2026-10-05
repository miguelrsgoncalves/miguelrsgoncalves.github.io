//#region imports

const fs = require('node:fs')
const path = require('node:path')

const paths = require('./paths')

//#endregion

function routes(dir) {
    return fs.readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
        .map(entry => {
            let source = path.join(entry.parentPath, entry.name)
            let extension = path.extname(source)
            let source_relative = path.relative(dir, source)
            let route = path.join(path.dirname(source_relative), path.basename(source_relative, extension))

            source, extension, source_relative, route = handle_special_cases(source, extension, source_relative, route)

            const output = path.join(route, 'index.html')

            return { route, output, source }
        })
        .sort((a, b) => {
            const depth = a.route.split('/').length - b.route.split('/').length
            return depth !== 0 ? depth : a.route.localeCompare(b.route)
        });
}

function handle_special_cases(source, extension, source_relative, route) {
    if (source === paths.ROOT_ROUTE_FILE) route = ''

    return source, extension, source_relative, route
}

module.exports = { routes }