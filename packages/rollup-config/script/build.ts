import { rollup } from 'rollup'
import manifest from '../package.json' assert { type: 'json' }
import { createRollupConfig, tsPresetConfigBuilder } from '../src'

async function build(): Promise<void> {
  const configs = await createRollupConfig({
    manifest,
    presetConfigBuilders: [
      tsPresetConfigBuilder({
        typescriptOptions: {
          tsconfig: 'tsconfig.src.json',
        },
      }),
    ],
  })

  for (const config of configs) {
    const bundle = await rollup(config)

    const outputOptions = [config.output ?? []].flat()
    for (const outputOption of outputOptions) {
      await bundle.write(outputOption)
    }
  }
}

void build()
