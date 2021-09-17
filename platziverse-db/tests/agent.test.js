'use strict'

const test = require('ava')

const config = {
  logging: function () {}
}
let db = null

test.beforeEach(async () => {
  const setupDatabase = require('../')
  db = await setupDatabase(config)
})

test('make it pass', t => {
  t.truthy(db.Agent, 'Agent services should exist')
})
