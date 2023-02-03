import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import { desensitize, locateFixtures } from 'jest.helper'
import path from 'node:path'
import url from 'node:url'
import {
  collectAllDependencies,
  getDefaultDependencyFields,
  locateLatestPackageJson,
} from '../src/dependency'

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
    expect(dependencies).toEqual(['@guanghechen/helper-path', 'import-meta-resolve'])

    expect(desensitize(logMock.getIndiscriminateAll())).toEqual([
      ["cannot find package.json for '@guanghechen/helper-path'"],
      ["cannot find package.json for 'import-meta-resolve'"],
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
        'no such file or directory: <$WORKSPACE$>/packages/helper-npm/__test__/fixtures/nonexistent/package.json',
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

describe('locateLatestPackageJson', () => {
  test('basic', () => {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
    expect(locateLatestPackageJson(__dirname)).toBe(path.join(__dirname, '../package.json'))
  })
})
