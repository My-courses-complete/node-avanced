<template>
  <div>
    <agent
      v-for="agent in agents"
      :uuid="agent.uuid"
      :key="agent.uuid"
      :socket="socket">
    </agent>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<style>
  body {
    font-family: Arial;
    background: #f8f8f8;
    margin: 0;
  }
</style>

<script>
const axios = require('axios')
const io = require('socket.io-client')
const socket = io()

module.exports = {
  data () {
    return {
      agents: [],
      error: null,
      socket
    }
  },

  mounted () {
    this.initialize()
  },

  methods: {
    async initialize () {
      let result
      try {
        result = await axios.get(`http://localhost:8080/agents`).then(res => res.data)
      } catch (error) {
        this.error = error.error
        return
      }

      this.agents = result

      socket.on('agent/connected', payload => {
        const { uuid } = payload.agent
        const existing = this.agents.find(a => a.uuid = uuid)
        console.log('existing', existing)
        if(!existing) {
          this.agents.push(payload.agent)
        }
      })
    }
  }
}
</script>
