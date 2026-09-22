const path = require('node:path');

const ROOT = path.resolve(BUILDER_DIR, '..');
const BUILDER_DIR = __dirname;

const BUILD_DIR = path.join(BUILDER_DIR, '.build');
const MANIFEST_FILE = path.join(BUILD_DIR, '.build-manifest.json');