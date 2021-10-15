'use strict'

const express = require('express')
const axios = require('axios')

const { endpoint, apiToken } = require('./config')

const api = express.Router()


api.get('/agents', async (req, res, next) => {
  const options = {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await axios.get(`${endpoint}/api/agents`, options).then(res => res.data)
  } catch (error) {
    next(error)
  }

  res.send(result)
})

api.get('/agents/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  const options = {
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }
  let agent
  try {
    agent = await axios.get(`${endpoint}/api/agents/${uuid}`, options).then(res => res.data)
  } catch (error) {
    next(error)
  }

  res.send(agent)
})

api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  const options = {
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }
  
  let result
  try {
    result = await axios.get(`${endpoint}/api/metrics/${uuid}`, options).then(res => res.data)
  } catch (error) {
    next(error)
  }

  res.send(result)
})

api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type} = req.params
  const options = {
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await axios.get(`${endpoint}/api/metrics/${uuid}/${type}`, options).then(res => res.data)
  } catch (error) {
    next(error)
  }

  res.send(result)
})

module.exports = api