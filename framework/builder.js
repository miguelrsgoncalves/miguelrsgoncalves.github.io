//#region imports

const fs = require('node:fs')

const paths = require('./paths')
const scanner = require('./scanner')
const parser = require('./parser')
const generator = require('./generator')
const logger = require('./logger')

//#endregion

//#region entry_point

const start_time = performance.now()

const args = process.argv.slice(2)

if (args.includes('clear')) {
  logger.add(['Mode'], 'Clear Build')
  clear_build()
} else {
  logger.add(['Mode'], 'Build')
  build()
}

logger.flush(start_time)

//#endregion

//#region build

function build() {
  clear_build()

  const cname = fs.readFileSync(paths.CNAME_FILE, 'utf-8')
  logger.add(['Files', 'CNAME'], cname)

  const shell = fs.readFileSync(paths.SHELL_FILE, 'utf-8')
  logger.add(['Files', 'Shell'], shell != null ? 'Success' : 'Failed')

  const routes = scanner.routes(paths.PAGES_DIR)

  for (const route of routes) {
    logger.add(
      ['Routes', route.route],
      {
        output: route.output,
        source: route.source
      }
    )
  }
}

//#endregion

//#region clear_build

function clear_build() {
  return
}

//#endregion