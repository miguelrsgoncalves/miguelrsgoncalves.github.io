const path = require('node:path');

const ROOT = path.resolve(BUILDER_DIR, '..');
const BUILDER_DIR = __dirname;

//#region build

const BUILD_DIR = path.join(BUILDER_DIR, '.build');
const MANIFEST_FILE = path.join(BUILD_DIR, '.build-manifest.json');

//#endregion

//#region framework

const SHELL_FILE = path.join(ROOT, 'index.html')

//#endregion