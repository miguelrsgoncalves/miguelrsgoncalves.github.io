class Node {
  constructor(type, fields = {}) {
    this.type = type
    this.children = []

    for (const [key, value] of Object.entries(fields)) this[key] = value
  }
}

module.exports = { }