'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const metricFixtures = require('./fixtures/metric')
const agentFixtures = require('./fixtures/agent')

const config = {
  logging: function () {}
}

let db = null
let sandbox = null
let MetricStub = null
let AgentStub = null
const uuid = 'yyy-yyy-yyy'
const type = 'cpu'

const newMetric = {
  agentId: 1,
  type: 'memoria',
  value: 1.5
}

const metricArgs = {
  attributes: ['type'],
  group: ['type'],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

const typeUuidArgs = {
  attributes: ['id', 'type', 'value', 'createdAt'],
  where: {
    type
  },
  limit: 20,
  order: [['createdAt', 'DESC']],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

const uuidArgs = {
  where: { uuid }
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  MetricStub = {
    belongsTo: sinon.spy()
  }

  AgentStub = {
    hasMany: sinon.spy()
  }

  // Model create stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
    toJSON () { return newMetric }
  }))

  metricArgs.include[0].model = AgentStub
  typeUuidArgs.include[0].model = AgentStub

  // Model findByAgentUuid
  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs().returns(Promise.resolve(metricFixtures.all))
  MetricStub.findAll.withArgs(metricArgs).returns(Promise.resolve(metricFixtures.findByAgentUuid(uuid)))
  MetricStub.findAll.withArgs(typeUuidArgs).returns(Promise.resolve(metricFixtures.findByTypeAgentUuid(type, uuid)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(t => {
  sandbox && sinon.restore()
})

test('Metric', t => {
  t.truthy(db.Metric, 'Metric services should exist')
})

test.serial('Setup', (t) => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    'Arguments should be the MetricModel'
  )
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    'Arguments should be the AgentModel'
  )
})

test.serial('Metric#findByAgentUuid', async t => {
  const metrics = await db.Metric.findByAgentUuid(uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(metricArgs), 'findAll should be called with args')

  t.deepEqual(metrics, metricFixtures.findByAgentUuid(uuid), 'metric should be the same')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  const metrics = await db.Metric.findByTypeAgentUuid(type, uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(typeUuidArgs), 'findAll should be called with args')

  t.deepEqual(metrics, metricFixtures.findByTypeAgentUuid(type, uuid), 'metric should be the same')
})

test.serial('Metric#create', async t => {
  const metric = await db.Metric.create(uuid, newMetric)

  t.true(AgentStub.findOne.called, 'Agent findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'Agent findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'Agent findOne should be called with uuid args')

  t.true(MetricStub.create.called, 'create should be called on model')
  t.true(MetricStub.create.calledOnce, 'create should be called once')
  t.true(MetricStub.create.calledWith(newMetric), 'create should be called with args')

  t.deepEqual(metric, newMetric, 'metric should be the same')
})
