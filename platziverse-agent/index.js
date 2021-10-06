'use strict'

const EventEmitter = require('events')

class PlatziverseAgent extends EventEmitter {
  constructor (opts) {
    super()

    this.options = opts
    this._timer = null
    this._started = null
  }

  connect () {
    if (!this._started) {
      this._started = true
      this.emit('connected')
      const opts = this.options
      this._timer = setInterval(() => {
        this.emit('agent/message', 'this is a message')
      }, opts.interval)
    }
  }

  disconnect () {
    if (this._started) {
      clearInterval(this._timer)
      this._started = false
      this.emit('disconnected')
    }
  }
}

module.exports = PlatziverseAgent
