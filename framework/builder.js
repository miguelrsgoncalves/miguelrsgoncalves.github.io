const { readFileSync } = require('node:fs')

const paths = require('./paths')
const scanner = require('./scanner')
const generator = require('./generator')

var is_build = true

if (process.argv[2] === 'clear') {
  is_build = false
}

if (is_build) {
  build()
} else {
  clear_build()
}

function build() {
  clear_build()

  let cname
  try {
    cname = readFileSync(paths.CNAME_FILE, 'utf-8')
  } catch (err) {
    console.log(`ERROR: CNAME unreadable (${err.code})`)
    return
  }

  let shell
  try {
    shell = readFileSync(paths.SHELL_FILE, 'utf-8')
  } catch (err) {
    console.log(`ERROR: Shell unreadable (${err.code})`)
    return
  }

  const routes = scanner.routes(paths.PAGES_DIR)

  console.log(routes)
}

function clear_build() {
  return
}