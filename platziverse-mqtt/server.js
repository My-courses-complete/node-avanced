'use strict'

const debug = require('debug')('platziverse:mqtt')
const chalk = require('chalk')
const mqemitter = require('mqemitter-redis')
const redisPersistence = require('aedes-persistence-redis')

function startAedes(){ 
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

  server.listen(port, function () {
    debug(`${chalk.green('[platziverse-mqtt]')} server is running`)
    aedes.publish({topic: 'agent/message', payload: "I'm broker "+aedes.id})
  })

  aedes.on('client', client => {
    debug(`Client Connected: ${client.id}`)
  })

  aedes.on('clientDisconnect', client => {
    debug(`Client Disconnected: ${client.id}`)
  })

  aedes.on('publish', (packet, client) => {
    debug(`Received: ${packet.topic}`)
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

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
