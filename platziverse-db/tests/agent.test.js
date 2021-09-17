'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const config = {
  logging: function () {}
}

let MetricStub = {
    belongsTo: sinon.spy()
}

let AgentStub = null
let db = null
let sandbox = null

test.beforeEach(async () => {
    sandbox = sinon.createSandbox()
    AgentStub = {
        hasMany: sandbox.spy()
    }
    
  const setupDatabase = proxyquire('../', {
      './models/agent': () => AgentStub,
      './models/metric': () => MetricStub,
  })
  db = await setupDatabase(config)
})

test.afterEach(t => {
    sandbox && sinon.restore()
})

test('make it pass', t => {
  t.truthy(db.Agent, 'Agent services should exist')
})

test.serial('Setup', t => {
    t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
    t.true(AgentStub.hasMany.calledWith(MetricStub), 'Arguments should be the MetricModel')
    t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
    t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Arguments should be the AgentModel')
})
