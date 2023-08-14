// eslint-disable-next-line import/no-extraneous-dependencies
import { createConsoleMock } from '@guanghechen/helper-jest'
import { desensitize, locateFixtures } from 'jest.helper'
import path from 'node:path'
import url from 'node:url'
import { collectAllDependencies, getDefaultDependencyFields } from '../src/index.mjs'

describe('getDefaultDependencyFields', () => {
  test('basic', () => {
    expect(getDefaultDependencyFields()).toMatchInlineSnapshot(`
      [
        "dependencies",
        "optionalDependencies",
        "peerDependencies",
      ]
    `)
  })
})

describe('collectAllDependencies', () => {
  /** @type {import('@guanghechen/helper-jest').IConsoleMock} */
  let logMock
  beforeEach(() => {
    logMock = createConsoleMock(['warn'])
  })
  afterEach(async () => {
    logMock.restore()
  })

  test('current repo', async () => {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
    const dependencies = await collectAllDependencies(path.join(__dirname, '../package.json'))
    expect(dependencies).toEqual(['import-meta-resolve'])
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
    expect(desensitize(logMock.getIndiscriminateAll())).toMatchInlineSnapshot(`
      [
        [
          "no such file or directory: <$WORKSPACE$>/packages/helper-npm/__test__/fixtures/nonexistent/package.json",
        ],
      ]
    `)
  })

  test('normal repo', async () => {
    const dependencies = await collectAllDependencies(locateFixtures('normal-repo/package.json'), [
      'peerDependencies',
    ])
    expect(dependencies).toEqual(['@guanghechen/not-existed-repo', 'rollup'])
    expect(desensitize(logMock.getIndiscriminateAll())).toMatchInlineSnapshot(`
      [
        [
          "cannot find package.json for '@guanghechen/not-existed-repo'",
        ],
      ]
    `)
  })
})
