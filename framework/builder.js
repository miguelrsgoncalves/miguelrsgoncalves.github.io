const { readFileSync } = require('node:fs');

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
  let cname;
  try {
    cname = readFileSync(paths.CNAME_FILE, 'utf-8');
  } catch (err) {
    console.log(`ERROR: CNAME unreadable (${err.code})`);
    return;
  }

  let shell;
  try {
    shell = readFileSync(paths.SHELL_FILE, 'utf-8');
  } catch (err) {
    console.log(`ERROR: Shell unreadable (${err.code})`);
  }
}