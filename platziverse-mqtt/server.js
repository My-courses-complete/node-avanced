'use strict'

const debug = require('debug')('platziverse:mqtt')
const aedes = require('aedes')
const chalk = require('chalk')
const mqemitter = require('mqemitter-redis')
const redisPersistence = require('aedes-persistence-redis')

function startAedes(){ 
    const port = 1883;

    const aedesServer = aedes({
        mq: mqemitter({
            port: 6379,
            host: '127.0.0.1',
            family:4
        }),
        persistence: redisPersistence({
            port: 6379,
            host: '127.0.0.1',
            family: 4
        })
    })

    const server = require('net').createServer(aedesServer.handle)

    server.listen(port, function(){
        debug(`${chalk.green('[platziverse-mqtt]')} server is running`)
    })
}

startAedes()