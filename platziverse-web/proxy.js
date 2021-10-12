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

api.get('/agents/:uuid', (req, res) => {})

api.get('/metrics/:uuid', (req, res) => {})

api.get('/metrics/:uuid/:type', (req, res) => {})

module.exports = api