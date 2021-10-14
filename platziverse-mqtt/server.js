'use strict'

const debug = require('debug')('platziverse:mqtt')
const chalk = require('chalk')
const mqemitter = require('mqemitter-redis')
const redisPersistence = require('aedes-persistence-redis')
const db = require('platziverse-db')

const { parsePayload } = require('./utils')

let Metric, Agent
const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: (s) => debug(s),
  setup: false
}

function startAedes () {
  const port = 1883

  const aedes = require('aedes')({
    mq: mqemitter({
      port: 6379,
      host: '127.0.0.1',
      family: 4
    }),
    persistence: redisPersistence({
      port: 6379,
      host: '127.0.0.1',
      family: 4
    })
  })

  const server = require('net').createServer(aedes.handle)
  const clients = new Map()

  server.listen(port, async function () {
    const services = await db(config).catch(handleFatalError)
    Metric = services.Metric
    Agent = services.Agent

    debug(`${chalk.green('[platziverse-mqtt]')} server is running`)
  })

  aedes.on('client', client => {
    debug(`Client Connected: ${client.id}`)
    clients.set(client.id, null)
  })

  aedes.on('clientDisconnect', async client => {
    debug(`Client Disconnected: ${client.id}`)
    const agent = clients.get(client.id)

    if (agent) {
      // Mark Agent as disconnected
      agent.connected = false

      try {
        await Agent.createOrUpdate(agent)
      } catch (error) {
        return handleError(error)
      }

      // Delete Agent from Clients List
      clients.delete(client.id)

      aedes.publish({
        topic: 'agent/disconnected',
        payload: JSON.stringify({
          agent: {
            uuid: agent.uuid
          }
        })
      })
      debug(`Client (${client.id}) associated to Agent (${agent.uuid}) marked as disconnected`)
    }
  })

  aedes.on('publish', async (packet, client) => {
    debug(`Received: ${packet.topic}`)
    switch (packet.topic) {
      case 'agent/connected':
        debug(`Payload: ${packet.payload}`)
        break
      case 'agent/disconnected':
        debug(`Payload: ${packet.payload}`)
        break
      case 'agent/message':
        debug(`Payload: ${packet.payload}`)
        const payload = parsePayload(packet.payload)

        if (payload) {
          payload.agent.connected = true

          let agent
          try {
            agent = await Agent.createOrUpdate(payload.agent)
          } catch (error) {
            return handleError(error)
          }

          debug(`Agent ${agent.uuid} saved`)
          // Notify Agent is Connected
          if (!clients.get(client.id)) {
            clients.set(client.id, agent)
            aedes.publish({
              topic: 'agent/connected',
              payload: JSON.stringify({
                agent: {
                  uuid: agent.uuid,
                  name: agent.name,
                  hostname: agent.hostname,
                  pid: agent.pid,
                  connected: agent.connected
                }
              })
            })
          }

          // Store Metrics
          const saveMetricPromise = []
          for (const metric of payload.metrics) {
            saveMetricPromise.push(
              new Promise((resolve, reject) => {
                Metric.create(agent.uuid, metric)
                  .then(m => {
                    debug(`Metric ${m.id} saved on agent ${agent.uuid}`)
                    resolve(m)
                  })
                  .catch(reject)
              })
            )
          }
          await Promise.all(saveMetricPromise)
        }
        break
    }
    debug(`Payload: ${packet.payload}`)
  })

  aedes.on('error', handleFatalError)
}

startAedes()

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

function handleError (err) {
  console.error(`${chalk.red('[Error]')} ${err.message}`)
  console.error(err.stack)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
