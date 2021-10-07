'use strict'

const debug = require('debug')('platziverse:api')
const chalk = require('chalk')
const http = require('http')
const express = require('express')

const api = require('./api')

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)

app.use('/api', api)

app.use((err, req, res, next) => {
  debug(`${chalk.red(['Error'])} ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }

  res.status(500).send({ error: err.message })
})

function handleFatalError (err) {
  debug(`${chalk.red(['Error'])} ${err.message}`)
  debug(err.stack)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  debug(`listening in ${chalk.green(`http://localhost:${port}`)}`)
})
