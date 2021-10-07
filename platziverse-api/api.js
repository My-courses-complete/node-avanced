'use strict'

const debug = require('debug')('platziverse:api:routes')
const chalk = require('chalk')
const express = require('express')
const db = require('platziverse-db')

const config = require('./config')

const api = express.Router()

let services, Agent, Metric

api.use('*', async (req, res,next) => {
  if(!services) {
    debug(`${chalk.green(['Conecting to database'])}`)
    try {
      services = await db(config.db)
    } catch (error) {
      return next(error)
    }

    Agent = services.Agent
    Metric = services.Metric
  }
  next()
})

api.get('/agents', (req, res) => {
  debug('A request has come to /agents')
  res.send({})
})

api.get('/agents/:uuid', (req, res, next) => {
  const { uuid } = req.params

  if (uuid !== 'yyy') {
    return next(new Error('Agent not found'))
  }
  res.send({ uuid })
})

api.get('metrics/:uuid', (req, res) => {
  const { uuid } = req.params
  res.send({ uuid })
})

api.get('/metrics/:uuid/:type', (req, res) => {
  const { uuid, type } = req.params
  res.send({ uuid, type })
})

module.exports = api
