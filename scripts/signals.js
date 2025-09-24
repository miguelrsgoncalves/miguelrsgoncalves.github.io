var cleanupSignal = {
  subscribers: [],

  subscribe(callback) {this.subscribers.push(callback)},

  cleanup() {
    this.subscribers.forEach(callback => callback())
    this.subscribers = []
  }
}