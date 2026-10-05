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

    const bar = style.guide('─'.repeat(process.stdout.columns || 8))

    const output = [
        '\n',
        style.title('Builder'),
        bar,
        '\n',
        style.key('● Log'),
        ...render(log),
        '\n',
        bar,
        style.success('✔ Build successful'),
        '\n',
    ]

    process.stdout.write(output.join('\n') + '\n')
}

function add(path, value, override = false) {
    if (!is_verbose) return

    const last = path.at(-1)
    const parent = path.slice(0, -1).reduce((node, key) => node[key] ??= {}, log)

    if (override || !(last in parent)) {
        parent[last] = value
    } else {
        parent[last].push(...[].concat(value))
    }
}

function is_plain_object(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

//#region render

function is_container(value) {
    return Array.isArray(value) || is_plain_object(value)
}

function is_empty_container(value) {
    return is_container(value) && Object.keys(value).length === 0
}

function format_value(value) {
    if (typeof value === 'string') return style.string(value)
    if (typeof value === 'number') return style.number(value)
    if (typeof value === 'boolean') return style.boolean(value)
    if (value === null || value === undefined) return style.empty(String(value))
    if (Array.isArray(value)) return style.empty('[]')
    if (is_plain_object(value)) return style.empty('{}')
    return String(value)
}

function render(node, prefix = '') {
    const output = []
    const keys = Object.keys(node)
    const is_array = Array.isArray(node)

    keys.forEach((key, i) => {
        const value = node[key]
        const is_last = i === keys.length - 1

        const branch = style.guide(prefix + (is_last ? '└─ ' : '├─ '))
        const next_prefix = prefix + (is_last ? '   ' : '│  ')
        const name = is_array ? `#${key}` : key

        if (is_container(value) && !is_empty_container(value)) {
            output.push(branch + style.key(name))
            output.push(...render(value, next_prefix))
        } else if (is_array) {
            output.push(branch + format_value(value))
        } else {
            output.push(branch + style.key(name) + style.guide(': ') + format_value(value))
        }
    })

    return output
}

//#endregion

//#region style

const THEME = {
    title: { color: '#ff4a46', bold: true },
    key: { color: '#61afef', bold: true },
    string: { color: '#98c379' },
    number: { color: '#d19a66' },
    boolean: { color: '#c678dd' },
    empty: { color: '#7f848e' },
    guide: { color: '#4b5263' },
    success: { color: '#98c379', bold: true },
}

const use_color = process.stdout.isTTY && !process.env.NO_COLOR

function painter({ color, bold = false }) {
    if (!use_color) return (text) => text

    const [r, g, b] = color.slice(1).match(/../g).map(h => parseInt(h, 16))
    const codes = [bold ? '1' : null, `38;2;${r};${g};${b}`].filter(Boolean).join(';')

    return (text) => `\x1b[${codes}m${text}\x1b[0m`
}

const style = Object.fromEntries(
    Object.entries(THEME).map(([name, specs]) => [name, painter(specs)])
)

//#endregion

module.exports = { flush, add }