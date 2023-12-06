import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import { desensitize } from 'jest.helper'
import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import { rollup } from 'rollup'
import type { OutputOptions, RollupOutput } from 'rollup'
import { createRollupConfig, tsPresetConfigBuilder } from '../src'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

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
    presetConfigBuilders: [
      tsPresetConfigBuilder({
        typescriptOptions: {
          tsconfig: 'tsconfig.src.json',
        },
      }),
    ],
  })

  const results: any[] = []
  for (const config of configs) {
    const bundle = await rollup(config)
    const outputOptions: OutputOptions[] = [config.output ?? []].flat()
    for (const outputOption of outputOptions) {
      const outputs = await bundle.generate(outputOption)
      for (const output of outputs.output as any[]) {
        const { format } = outputOption
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
  await fs.rm('lib', { recursive: true, force: true })
  process.chdir(__dirname)
})

describe('build', () => {
  let logMock: IConsoleMock
  beforeEach(() => {
    logMock = createConsoleMock(['warn'])
  })
  afterEach(async () => {
    logMock.restore()
  })

  it('simple', async () => {
    const caseDir = resolveCaseDir('simple')
    process.chdir(caseDir)
    const results = await build(['@guanghechen/rollup-config'])
    for (const result of results) {
      const { format, ...output } = result as any
      const data = output.code != null ? output.code : output
      expect(data).toMatchSnapshot(`rollup ${format}`)
    }

    expect(desensitize(logMock.getIndiscriminateAll())).toEqual([])
    // expect(existsSync(path.join(caseDir, 'lib/types/index.d.ts'))).toBeTruthy()
  }, 60000)
})
