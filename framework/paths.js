//#region imports

const path = require('node:path')

//#endregion

const FRAMEWORK = __dirname
const ROOT = path.resolve(FRAMEWORK, '..')

//#region build

const BUILD_DIR = path.join(FRAMEWORK, '.build')
const MANIFEST_FILE = path.join(BUILD_DIR, '.build-manifest.json')

//#endregion

//#region framework

const CNAME_FILE = path.join(ROOT, 'CNAME')
const ROBOTS_FILE = path.join(ROOT, 'robots.txt')
const SITEMAP_FILE = path.join(ROOT, 'sitemap.xml')

const PAGES_DIR = path.join(ROOT, 'pages')
const WIDGETS_DIR = path.join(ROOT, 'widgets')

const SHELL_FILE = path.join(ROOT, 'shell.html')
const ROOT_ROUTE_FILE = path.join(PAGES_DIR, 'index.html')

//#endregion

module.exports = { ROOT, FRAMEWORK, BUILD_DIR, MANIFEST_FILE, CNAME_FILE, ROBOTS_FILE, SITEMAP_FILE, PAGES_DIR, WIDGETS_DIR, SHELL_FILE, ROOT_ROUTE_FILE }