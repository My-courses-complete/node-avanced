'use strict'

const metric = {
  id: 1,
  agentId: 1,
  type: 'memoria',
  value: 1.2,
  createdAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  extend(metric, { id: 2, value: 1.8 }),
  extend(metric, { id: 3, type: 'cpu', value: 10.7 }),
  extend(metric, { id: 4, agentId: 2, value: 1.5 })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

function findByAgentUuid (uuid) {
  return metrics.filter(m => m.agentId ? m.agentId === uuid : false).map(m => {
    const clone = Object.assign({}, m)
    delete m.agent
    return clone
  })
}

function findByTypeAgentUuid (type, uuid) {
  return metrics.filter(m => m.type === type && (m.agentId ? m.agentId === uuid : false)).map(m => {
    const clone = Object.assign({}, m)
    delete clone.agentId
    delete clone.agent
    return clone
  }).sort(sortBy('creadtedAt')).reverse()
}

function sortBy (property) {
  return (a, b) => {
    const aProp = a[property]
    const bProp = b[property]

    if (aProp < bProp) {
      return -1
    } else if (aProp > bProp) {
      return 1
    } else {
      return 0
    }
  }
}

module.exports = {
  single: metric,
  all: metrics,
  findByAgentUuid,
  findByTypeAgentUuid
}
