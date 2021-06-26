import fs from 'fs-extra'
import path from 'path'
import { rollup } from 'rollup'
import type { OutputOptions, RollupOutput } from 'rollup'
import createRollupConfigs from '../src'

// Resolve absolute dirPath of case
const resolveCaseDir = (title: string): string =>
  path.resolve(__dirname, 'fixtures', title)

async function build(): Promise<RollupOutput[]> {
  // Create rollup config
  const { default: configOptions } = await import(path.resolve('config.ts'))
  const configs = createRollupConfigs(configOptions)

  const results: any[] = []
  for (const config of configs) {
    const bundle = await rollup(config)

    if (config.output == null) continue

    const outputOptions: OutputOptions[] = Array.isArray(config.output)
      ? config.output
      : [config.output]
    for (const outputOption of outputOptions) {
      const outputs = await bundle.generate(outputOption)
      for (const output of outputs.output as any[]) {
        const { format } = outputOption
        if (output.code != null) {
          results.push({ format, code: output.code })
        } else if (output.type === 'asset') {
          results.push({
            format,
            type: output.type,
            name: output.name,
            source: output.source.toString(),
            fileName: output.fileName,
          })
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
  await fs.remove('node_modules')
  process.chdir(__dirname)
})

describe('build', function () {
  // Timeout: 60s
  jest.setTimeout(60000)

  test('simple', async function () {
    const caseDir = resolveCaseDir('simple')
    process.chdir(caseDir)

    const results = await build()
    for (const result of results) {
      const { format, ...output } = result as any
      const data = output.code != null ? output.code : output
      expect(data).toMatchSnapshot(`rollup ${format}`)
    }
    // expect(fs.existsSync('lib/types/index.d.ts')).toBeTruthy()
    expect(fs.existsSync('lib/assets/font/tangerine.woff2')).toBeTruthy()
    expect(fs.existsSync('lib/assets/image/background.jpeg')).toBeTruthy()
    expect(fs.existsSync('src/style/index.styl.d.ts')).toBeTruthy()

    // Perform some cleanup operations.
    await fs.remove('src/style/index.styl.d.ts')
  })
})
