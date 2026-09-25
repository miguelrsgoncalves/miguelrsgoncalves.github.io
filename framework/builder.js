const { existsSync, readFileSync } = require('node:fs');

const paths = require('./paths');

var is_build = true

if (process.argv[2] === 'clear') {
  is_build = false
}

if (is_build) {
  build()
} else {
  return
}

function build() {
  const domain = `https://${readFileSync(paths.CNAME_FILE, 'utf-8').trim()}`;

  if (!existsSync(paths.SHELL_FILE)) {
    console.log(`ERROR: Shell file not found at ${paths.SHELL_FILE}`);
    return;
  }
}