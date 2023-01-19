import tsnode from 'ts-node'

// Must be executed before import from './src'
tsnode.register({
  dir: __dirname,
  files: true,
  project: 'tsconfig.src.json',
})

const { createRollupConfig } = require('@guanghechen/rollup-config/src/index.ts')

const config = createRollupConfig({
  manifest: {
    source: 'src/index.ts',
    main: 'lib/cjs/index.js',
    module: 'lib/esm/index.js',
    dependencies: [],
  },
  pluginOptions: {
    typescriptOptions: { tsconfig: 'tsconfig.src.json' },
  },
})

export default config
