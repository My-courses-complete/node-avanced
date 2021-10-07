'use strict'

const debug = require('debug')('platziverse:api:db')

const config = require('../config')

module.exports = {
  db: {
    ...config(false, debug)
  }
}
