#! /usr/bin/env node

const { launch } = require('@guanghechen/helper-plop')
const path = require('path')

launch(process.argv, args => ({
  configPath: args.plopfile || path.join(__dirname, 'index.js'),
}))
