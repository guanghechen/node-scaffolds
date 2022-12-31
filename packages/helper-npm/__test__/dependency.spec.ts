import { jest } from '@jest/globals'
import { desensitize, locateFixtures } from 'jest.helper'
import path from 'node:path'
import url from 'node:url'
import { collectAllDependencies, getDefaultDependencyFields, locateLatestPackageJson } from '../src'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

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
  test('basic', () => {
    expect(collectAllDependencies(path.join(__dirname, '../package.json'))).toEqual([
      '@guanghechen/helper-path',
      '@guanghechen/invariant',
    ])

    expect(
      collectAllDependencies(
        locateFixtures('monorepo2/package.json'),
        undefined,
        ['rollup'],
        () => true,
      ),
    ).toEqual([
      '@ampproject/remapping',
      '@babel/code-frame',
      '@babel/compat-data',
      '@babel/core',
      '@babel/generator',
      '@babel/helper-compilation-targets',
      '@babel/helper-environment-visitor',
      '@babel/helper-function-name',
      '@babel/helper-hoist-variables',
      '@babel/helper-module-imports',
      '@babel/helper-module-transforms',
      '@babel/helper-simple-access',
      '@babel/helper-split-export-declaration',
      '@babel/helper-string-parser',
      '@babel/helper-validator-identifier',
      '@babel/helper-validator-option',
      '@babel/helpers',
      '@babel/highlight',
      '@babel/parser',
      '@babel/template',
      '@babel/traverse',
      '@babel/types',
      '@jridgewell/gen-mapping',
      '@jridgewell/resolve-uri',
      '@jridgewell/set-array',
      '@jridgewell/sourcemap-codec',
      '@jridgewell/trace-mapping',
      'ansi-styles',
      'browserslist',
      'caniuse-lite',
      'chalk',
      'color-convert',
      'color-name',
      'convert-source-map',
      'debug',
      'electron-to-chromium',
      'escalade',
      'fsevents',
      'gensync',
      'globals',
      'has-flag',
      'js-tokens',
      'jsesc',
      'json5',
      'lru-cache',
      'ms',
      'node-releases',
      'picocolors',
      'rollup',
      'semver',
      'supports-color',
      'to-fast-properties',
      'type-fest',
      'update-browserslist-db',
      'yallist',
    ])

    const warningDataList: unknown[] = []
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation((...args) => void warningDataList.push(...args))

    expect(
      collectAllDependencies(locateFixtures('normal-repo/package.json'), ['peerDependencies']),
    ).toEqual(['@guanghechen/not-existed-repo', 'rollup'])

    expect(desensitize(warningDataList)).toEqual([
      "cannot find package.json for '@guanghechen/not-existed-repo'",
    ])

    warnSpy.mockRestore()
  })
})

describe('locateLatestPackageJson', () => {
  test('basic', () => {
    expect(locateLatestPackageJson(__dirname)).toBe(path.join(__dirname, '../package.json'))
  })
})
