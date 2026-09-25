const path = require('node:path');

module.exports = { ROOT, BUILDER_DIR, BUILD_DIR, MANIFEST_FILE, CNAME_FILE, SHELL_FILE };

const ROOT = path.resolve(BUILDER_DIR, '..');
const BUILDER_DIR = __dirname;

//#region build

const BUILD_DIR = path.join(BUILDER_DIR, '.build');
const MANIFEST_FILE = path.join(BUILD_DIR, '.build-manifest.json');

//#endregion

//#region framework

const CNAME_FILE = path.join(ROOT, 'CNAME')
const SHELL_FILE = path.join(ROOT, 'index.html')

//#endregion