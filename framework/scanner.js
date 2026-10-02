const fs = require('node:fs');
const path = require('node:path');

const paths = require('./paths');

function scan_routes(dir) {
    let routes;
    try {
        routes = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
    } catch (err) {
        console.log(`ERROR: Cannot scan ${dir} (${err.code})`);
    return [];
    }

    return routes
        .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
        .map(entry => {
            let file = path.join(entry.parentPath, entry.name);
            let extension = path.extname(file)
            let file_relative = path.relative(dir, file)
            let route = path.join(path.dirname(file_relative), path.basename(file_relative, extension))

            file, extension, file_relative, route = handle_special_cases(file, extension, file_relative, route)

            return { route, file };
        })
        .sort((a, b) => {
            const depth = a.route.split('/').length - b.route.split('/').length;
            return depth !== 0 ? depth : a.route.localeCompare(b.route);
        });
}

function handle_special_cases(file, extension, file_relative, route) {
    if (route === paths.DEFAULT_ROUTE) route = ''

    return file, extension, file_relative, route
}

module.exports = { scan_routes };