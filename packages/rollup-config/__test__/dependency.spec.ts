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
      '@rollup/plugin-commonjs',
      '@rollup/plugin-json',
      '@rollup/plugin-node-resolve',
      '@rollup/plugin-typescript',
      'import-meta-resolve',
      'rollup',
      'rollup-plugin-dts',
    ])

    expect(desensitize(logMock.getIndiscriminateAll())).toEqual([
      ["cannot find package.json for '@rollup/plugin-commonjs'"],
      ["cannot find package.json for '@rollup/plugin-json'"],
      ["cannot find package.json for '@rollup/plugin-node-resolve'"],
      ["cannot find package.json for '@rollup/plugin-typescript'"],
      ["cannot find package.json for 'import-meta-resolve'"],
      ["cannot find package.json for 'rollup-plugin-dts'"],
      ["cannot find package.json for 'rollup'"],
    ])
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
      ["cannot find package.json for 'rollup'"],
    ])
  })

  test('normal repo', async () => {
    const dependencies = await collectAllDependencies(locateFixtures('normal-repo/package.json'), [
      'peerDependencies',
    ])
    expect(dependencies).toEqual(['@guanghechen/not-existed-repo', 'rollup'])

    expect(desensitize(logMock.getIndiscriminateAll())).toEqual([
      ["cannot find package.json for '@guanghechen/not-existed-repo'"],
      ["cannot find package.json for 'rollup'"],
    ])
  })
})
