/* eslint-disable import/order, import/no-extraneous-dependencies */
import path from 'path'
import tsnode from 'ts-node'
import manifest from './package.json'

// Must be executed before import from './src'
tsnode.register({
  dir: path.join(__dirname, '../..'),
  files: true,
  project: 'tsconfig.json',
})

const { createRollupConfig } = require('./src/index.ts')

export default createRollupConfig({
  manifest,
  pluginOptions: {
    typescriptOptions: { tsconfig: 'tsconfig.src.json' },
  },
})
