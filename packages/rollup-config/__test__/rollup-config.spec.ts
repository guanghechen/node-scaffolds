import { jest } from '@jest/globals'
import fs from 'fs-extra'
import path from 'node:path'
import url from 'node:url'
import { rollup } from 'rollup'
import type { OutputOptions, RollupOutput } from 'rollup'
import createRollupConfig from '../src'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

// Resolve absolute dirPath of case
const resolveCaseDir = (title: string): string => path.resolve(__dirname, 'fixtures', title)

async function build(dependencies: string[]): Promise<RollupOutput[]> {
  // Create rollup config
  const configs = await createRollupConfig({
    manifest: {
      name: '@guanghechen/rollup-config',
      source: 'src/index.ts',
      main: 'lib/cjs/index.js',
      module: 'lib/esm/index.js',
      types: 'lib/types/index.d.ts',
      dependencies: dependencies,
    },
    pluginOptions: {
      typescriptOptions: { tsconfig: 'tsconfig.src.json' },
    },
  })

  const results: any[] = []
  for (const config of configs) {
    const bundle = await rollup(config)
    for (const outputOptions of config.output as OutputOptions[]) {
      const outputs = await bundle.generate(outputOptions)
      for (const output of outputs.output as any[]) {
        const { format } = outputOptions
        if (output.code != null) {
          results.push({ format, code: output.code })
        } else {
          results.push({ format, ...output })
        }
      }
    }
  }
  return results
}

afterEach(async () => {
  await fs.remove('lib')
  process.chdir(__dirname)
})

describe('build', () => {
  test('simple', async () => {
    const caseDir = resolveCaseDir('simple')
    process.chdir(caseDir)
    const results = await build(['fs-extra', '@guanghechen/rollup-config'])
    for (const result of results) {
      const { format, ...output } = result as any
      const data = output.code != null ? output.code : output
      expect(data).toMatchSnapshot(`rollup ${format}`)
    }
    // expect(
    //   fs.existsSync(path.join(caseDir, 'lib/types/index.d.ts')),
    // ).toBeTruthy()
  }, 60000)
})
