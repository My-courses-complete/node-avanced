'use strict'

const debug = require('debug')('platziverse:api:db')

const { db, auth } = require('../config')(false, debug)

module.exports = {
  db,
  auth

}
