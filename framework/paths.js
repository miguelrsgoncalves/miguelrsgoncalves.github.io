const path = require('node:path');

const FRAMEWORK = __dirname;
const ROOT = path.resolve(FRAMEWORK, '..');

//#region build

const BUILD_DIR = path.join(FRAMEWORK, '.build');
const MANIFEST_FILE = path.join(BUILD_DIR, '.build-manifest.json');

//#endregion

//#region framework

const CNAME_FILE = path.join(ROOT, 'CNAME');
const ROBOTS_FILE = path.join(ROOT, 'robots.txt');
const SITEMAP_FILE = path.join(ROOT, 'sitemap.xml');

//#endregion

//#region website

const SHELL_FILE = path.join(ROOT, 'index.html');

const PAGES_DIR = path.join(ROOT, 'pages');
const WIDGETS_DIR = path.join(ROOT, 'widgets')

//#endregion

module.exports = { ROOT, FRAMEWORK, BUILD_DIR, MANIFEST_FILE, CNAME_FILE, ROBOTS_FILE, SITEMAP_FILE, SHELL_FILE, PAGES_DIR, WIDGETS_DIR };