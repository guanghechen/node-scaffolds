import { createRollupConfig, tsPresetConfigBuilder } from '@guanghechen/rollup-config'
import path from 'node:path'

export default async function rollupConfig() {
  const { default: manifest } = await import(path.resolve('package.json'), {
    with: { type: 'json' },
  })
  const config = await createRollupConfig({
    manifest,
    presetConfigBuilders: [
      tsPresetConfigBuilder({
        typescriptOptions: {
          tsconfig: 'tsconfig.lib.json',
          compilerOptions: {
            moduleResolution: 'node',
          },
        },
      }),
    ],
  })
  return config
}
