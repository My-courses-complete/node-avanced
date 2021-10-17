'use strict'

const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const minimist = require('minimist')
const db = require('./')
const config = require('../config')

const args = minimist(process.argv)
const prompt = inquirer.createPromptModule()

async function setup () {
  if (!args.yes) {
    const answer = await prompt([{
      type: 'confirm',
      name: 'setup',
      message: 'This will destroy your database, are you sure?'
    }])

    if (!answer.setup) {
      return console.log('Nothing happened :)')
    }
  }

  await db(config(true, debug)).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
