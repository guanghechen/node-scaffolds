import { jest } from '@jest/globals'
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
  test('current repo', async () => {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
    const dependencies = await collectAllDependencies(path.join(__dirname, '../package.json'))

    expect(dependencies).toEqual(['@guanghechen/helper-path', 'import-meta-resolve'])
  })

  test('nonexistent repo', async () => {
    const dependencies = await collectAllDependencies(
      locateFixtures('nonexistent/package.json'),
      undefined,
      ['rollup'],
      () => true,
    )

    expect(dependencies).toEqual(['@guanghechen/helper-path', 'import-meta-resolve', 'rollup'])
  })

  test('normal repo', async () => {
    const warningDataList: unknown[] = []
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation((...args) => void warningDataList.push(...args))

    const dependencies = await collectAllDependencies(locateFixtures('normal-repo/package.json'), [
      'peerDependencies',
    ])
    expect(dependencies).toEqual(['@guanghechen/not-existed-repo', 'rollup'])

    expect(desensitize(warningDataList)).toEqual([
      "cannot find package.json for '@guanghechen/not-existed-repo'",
    ])
    warnSpy.mockRestore()
  })
})

describe('locateLatestPackageJson', () => {
  test('basic', () => {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
    expect(locateLatestPackageJson(__dirname)).toBe(path.join(__dirname, '../package.json'))
  })
})
