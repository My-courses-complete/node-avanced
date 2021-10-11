'use strict'

const debug = require('debug')('platziverse:web')
const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const chalk = require('chalk')
const PlatziverseAgent = require('platziverse-agent')

const { pipe } = require('./util')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const agent = new PlatziverseAgent()

app.use(express.static(path.join(__dirname, 'public')))

io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  pipe(agent, socket)
})

function handleFatalError (err) {
  console.error(`${chalk.red('[fatl error]')} ${err.message}`)
  console.log(err.stack)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  debug(`Listening in ${chalk.green([`http://localhost:${port}`])}`)
  agent.connect()
})
