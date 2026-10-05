//#region entry_point

const args = process.argv.slice(2)
const is_verbose = args.includes('-v') || args.includes('--verbose')

//#endregion

let log = {}
let flushed = false

function flush() {
    if (!is_verbose) return

    if (flushed) return
    flushed = true

    process.stdout.write(JSON.stringify(log, null, 1))
}

function add(key, value, override = false) {
    if (!is_verbose) return

    if (override) {
        log[key] = value
    } else {
        const current = log[key]

        if (current) {
            current.push(...value)
        } else {
            log[key] = value
        }
    }
}

module.exports = { flush, add }