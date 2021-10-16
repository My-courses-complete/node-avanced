#!/usr/bin/env node

'use strict'

const minimist = require('minimist')

console.log('Hello Platziverse!')
const args = minimist(process.argv)
console.log(args)