// eslint-disable-next-line import/no-extraneous-dependencies
import createRollupConfig from '@guanghechen/rollup-config-cli'
import replace from '@rollup/plugin-replace'
import path from 'node:path'

async function rollupConfig() {
  const { default: manifest } = await import(path.resolve('package.json'), {
    assert: { type: 'json' },
  })
  const config = await createRollupConfig({
    manifest,
    pluginOptions: {
      typescriptOptions: { tsconfig: 'tsconfig.src.json' },
    },
    additionalPlugins: [
      replace({
        include: ['src/cli.ts'],
        delimiters: ['', ''],
        preventAssignment: true,
        values: {
          [`} from '.';`]: `} from './index.js';`,
        },
      })
    ],
    pluginOptions: {
      typescriptOptions: { tsconfig: 'tsconfig.src.json' },
    },
    targets: [{
      format: 'module',
      src: 'src/cli.ts',
      target: 'lib/esm/cli.js',
    }],
    resources: {
      copyOnce: true,
      verbose: true,
      targets: [
        {
          src: 'src/config/*',
          dest: 'lib/config',
        },
      ],
    },
  })
  return config
}

export default rollupConfig()
