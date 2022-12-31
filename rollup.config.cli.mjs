// eslint-disable-next-line import/no-extraneous-dependencies
import createRollupConfig from '@guanghechen/rollup-config-cli'
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
    resources: {
      copyOnce: true,
      verbose: true,
      targets: [
        {
          format: 'module',
          src: 'src/config/*',
          dest: 'lib/config',
        },
      ],
    },
    targets: [{ src: 'src/cli.ts', target: 'lib/esm/cli.js' }],
  })
  return config
}

export default rollupConfig()
