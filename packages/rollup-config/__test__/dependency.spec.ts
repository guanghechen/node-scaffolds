import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import { desensitize, locateFixtures } from 'jest.helper'
import path from 'node:path'
import url from 'node:url'
import { collectAllDependencies, getDefaultDependencyFields } from '../src/dependency'

describe('getDefaultDependencyFields', () => {
  test('basic', () => {
    expect(getDefaultDependencyFields()).toEqual([
      'dependencies',
      'optionalDependencies',
      'peerDependencies',
    ])
  })
})

describe('collectAllDependencies', () => {
  let logMock: IConsoleMock
  beforeEach(() => {
    logMock = createConsoleMock(['warn'])
  })
  afterEach(async () => {
    logMock.restore()
  })

  test('current repo', async () => {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
    const dependencies = await collectAllDependencies(path.join(__dirname, '../package.json'))
    expect(dependencies).toEqual([
      '@babel/code-frame',
      '@babel/helper-validator-identifier',
      '@babel/highlight',
      '@rollup/plugin-commonjs',
      '@rollup/plugin-json',
      '@rollup/plugin-node-resolve',
      '@rollup/plugin-typescript',
      'chalk',
      'import-meta-resolve',
      'js-tokens',
      'magic-string',
      'rollup',
      'rollup-plugin-dts',
      'sourcemap-codec',
      'typescript',
    ])

    expect(desensitize(logMock.getIndiscriminateAll())).toEqual([])
  })

  test('nonexistent repo', async () => {
    const dependencies = await collectAllDependencies(
      locateFixtures('nonexistent/package.json'),
      undefined,
      ['rollup'],
      () => true,
    )
    expect(dependencies).toEqual(['rollup'])

    expect(desensitize(logMock.getIndiscriminateAll())).toEqual([
      [
        'no such file or directory: <$WORKSPACE$>/packages/rollup-config/__test__/fixtures/nonexistent/package.json',
      ],
    ])
  })

  test('normal repo', async () => {
    const dependencies = await collectAllDependencies(locateFixtures('normal-repo/package.json'), [
      'peerDependencies',
    ])
    expect(dependencies).toEqual(['@guanghechen/not-existed-repo', 'rollup'])

    expect(desensitize(logMock.getIndiscriminateAll())).toEqual([
      ["cannot find package.json for '@guanghechen/not-existed-repo'"],
    ])
  })
})
