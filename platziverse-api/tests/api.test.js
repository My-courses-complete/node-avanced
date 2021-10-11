'use strict'

const test = require('ava')
const request = require('supertest')
const util = require('util')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')
const metricsFixtures = require('./fixtures/metric')
const auth = require('../auth')
const config = require('../config')
const sign = util.promisify(auth.sign)

let sandbox = null
let api = null
let server = null
let dbStub = null
let token = null
const AgentStub = {}
const MetricStub = {}

const uuid = 'yyy-yyy-yyy'
const uuidNotFound = 'yyy-yyy-yy1'
const id = 1
const type = 'memoria'
const typeNotFound = 'temp'

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))

  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  AgentStub.findByUuid.withArgs(uuidNotFound).returns(Promise.resolve(agentFixtures.byUuid(uuidNotFound)))

  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.withArgs(uuid).returns(Promise.resolve(metricsFixtures.findByAgentUuid(id)))
  MetricStub.findByAgentUuid.withArgs(uuidNotFound).returns(Promise.resolve(metricsFixtures.findByAgentUuid(uuidNotFound)))

  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.withArgs(type, uuid).returns(Promise.resolve(metricsFixtures.findByTypeAgentUuid(type, id)))

  token = await sign({ admin: true, username: 'platzi' }, config.auth.secret)

  api = proxyquire('../api', {
    'platziverse-db': dbStub
  })

  server = proxyquire('../server', {
    './api': api
  })
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test.serial.cb('/api/agents', (t) => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(agentFixtures.connected)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('api/agent/:uuid', t => {
  request(server)
    .get(`/api/agents/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(agentFixtures.byUuid(uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('api/agent/:uuid - not found', t => {
  request(server)
    .get(`/api/agents/${uuidNotFound}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.truthy(err, 'should return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify({ error: `Agent not found with ${uuidNotFound}` })
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    }
    )
})

test.serial.cb('api/metrics/:uuid', t => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(metricsFixtures.findByAgentUuid(id))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('api/metrics/:uuid - not found', t => {
  request(server)
    .get(`/api/metrics/${uuidNotFound}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.truthy(err, 'should return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify({ error: `Metrics not found for agent with uuid ${uuidNotFound}` })
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('api/metrics/:uuid/:type', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(metricsFixtures.findByTypeAgentUuid(type, id))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})
test.serial.cb('api/metrics/:uuid/:type - not found', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${typeNotFound}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.truthy(err, 'should return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify({ error: `Metrics (${typeNotFound}) not found for agent with uuid ${uuid}` })
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('api/agents - not token', t => {
  request(server)
    .get('/api/agents')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.truthy(err, 'should return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify({ error: 'No authorization token was found' })
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})
