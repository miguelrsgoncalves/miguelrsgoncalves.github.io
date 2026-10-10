//#region imports

const fs = require('node:fs')

//#endregion

class Node {
  constructor(type, fields = {}) {
    this.type = type
    this.children = []

    for (const [key, value] of Object.entries(fields)) this[key] = value
  }
}

function file(file) {
  const html = fs.readFileSync(file, 'utf-8')
  const root = new Node('root', { start: 0, end: source.length, innerStart: 0, innerEnd: source.length })

  if (source.length > 0) {
    root.children.push(new Node('text', {
      value: source,
      start: 0,
      end: source.length,
      innerStart: 0,
      innerEnd: source.length,
    }))
  }

  return { tree: root, errors: [] }
}

module.exports = { }