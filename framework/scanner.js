const fs = require('node:fs');
const path = require('node:path');

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
            const file = path.join(entry.parentPath, entry.name);
            const extension = path.extname(file)
            const file_relative = path.relative(dir, file)
            const route = path.join(path.dirname(file_relative), path.basename(file_relative, extension))
            return { route, file };
        })
        .sort((a, b) => {
            const depth = a.route.split('/').length - b.route.split('/').length;
            return depth !== 0 ? depth : a.route.localeCompare(b.route);
        });
}

module.exports = { scan_routes };