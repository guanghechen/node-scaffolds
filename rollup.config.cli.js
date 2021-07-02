import createRollupConfig from '@guanghechen/rollup-config-cli'
import path from 'path'

async function rollupConfig() {
  const { default: manifest } = await import(path.resolve('package.json'))
  const config = createRollupConfig({
    manifest,
    pluginOptions: {
      typescriptOptions: { tsconfig: 'tsconfig.src.json' },
    },
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
    targets: [{ src: 'src/cli.ts', target: 'lib/cjs/cli.js' }],
  })
  return config
}

export default rollupConfig()
