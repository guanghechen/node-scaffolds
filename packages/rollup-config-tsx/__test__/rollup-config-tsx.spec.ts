import { rm } from '@guanghechen/helper-fs'
import { existsSync } from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { rollup } from 'rollup'
import type { OutputOptions, RollupOutput } from 'rollup'
import type { IRollupConfigOptions } from '../src'
import createRollupConfigs from '../src'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

// Resolve absolute dirPath of case
const resolveCaseDir = (title: string): string => path.resolve(__dirname, 'fixtures', title)

async function build(configOptions: IRollupConfigOptions): Promise<RollupOutput[]> {
  // Create rollup config
  const configs = await createRollupConfigs(configOptions)

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

describe('build', function () {
  afterEach(async () => {
    // Perform some cleanup operations.
    await rm('lib')
    await rm('node_modules')
    await rm('src/style/index.styl.d.ts')
    process.chdir(__dirname)
  })

  test('modules', async function () {
    const caseDir = resolveCaseDir('modules')
    process.chdir(caseDir)

    const { default: configOptions } = await import(path.join(caseDir, 'config.ts'))
    const results = await build(configOptions)
    for (const result of results) {
      const { format, ...output } = result as any
      const data = output.code != null ? output.code : output
      expect(data).toMatchSnapshot(`rollup ${format}`)
    }
    // expect(fs.existsSync('lib/types/index.d.ts')).toEqual(true)
    expect(existsSync('lib/assets/font/tangerine.woff2')).toEqual(true)
    expect(existsSync('lib/assets/image/background.jpeg')).toEqual(true)
    expect(existsSync('src/style/index.styl.d.ts')).toEqual(true)
  }, 60000)

  // test('no modules', async function () {
  //   const caseDir = resolveCaseDir('no_modules')
  //   process.chdir(caseDir)

  //   const { default: configOptions } = await import(path.join(caseDir, 'config.ts'))
  //   const results = await build(configOptions)

  //   for (const result of results) {
  //     const { format, ...output } = result as any
  //     const data = output.code != null ? output.code : output
  //     expect(data).toMatchSnapshot(`rollup ${format}`)
  //   }
  //   // expect(fs.existsSync('lib/types/index.d.ts')).toEqual(true)
  //   expect(existsSync('lib/assets/font/tangerine.woff2')).toEqual(true)
  //   expect(existsSync('lib/assets/image/background.jpeg')).toEqual(true)
  //   expect(existsSync('src/style/index.styl.d.ts')).toEqual(false)
  // })
})
