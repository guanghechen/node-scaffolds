// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import { createReporterMock } from '@guanghechen/helper-jest'
import { Reporter, ReporterLevelEnum } from '@guanghechen/reporter'
import { desensitize, locateFixtures } from 'jest.helper'
import { existsSync } from 'node:fs'
import path from 'node:path'
import {
  emptyDir,
  ensureCriticalFilepathExistsSync,
  mkdirsIfNotExists,
  rm,
  writeFile,
} from '../src'

describe('empty', () => {
  const fictitiousDir = locateFixtures('fictitiousDir_c4266163b919b')

  afterEach(async () => {
    await rm(fictitiousDir)
  })

  it('basic', async () => {
    const dirpathA = path.join(fictitiousDir, 'A')
    const dirpathB = path.join(fictitiousDir, 'B')
    const filepathA = path.join(fictitiousDir, 'a.txt')
    const filepathB = path.join(dirpathB, 'b.txt')
    const filepathC = path.join(dirpathB, 'c.txt')

    expect(existsSync(fictitiousDir)).toEqual(false)

    await emptyDir(fictitiousDir)
    expect(existsSync(fictitiousDir)).toEqual(true)

    await rm(fictitiousDir)
    expect(existsSync(fictitiousDir)).toEqual(false)

    mkdirsIfNotExists(fictitiousDir, true)
    expect(existsSync(fictitiousDir)).toEqual(true)

    expect(existsSync(dirpathA)).toEqual(false)
    expect(existsSync(dirpathB)).toEqual(false)
    expect(existsSync(filepathA)).toEqual(false)
    expect(existsSync(filepathB)).toEqual(false)
    expect(existsSync(filepathC)).toEqual(false)
    await writeFile(filepathA, 'hello, A', 'utf8')
    await writeFile(filepathB, 'hello, B', 'utf8')
    await writeFile(filepathC, 'hello, C', 'utf8')
    expect(existsSync(dirpathA)).toEqual(false)
    expect(existsSync(dirpathB)).toEqual(true)
    expect(existsSync(filepathA)).toEqual(true)
    expect(existsSync(filepathB)).toEqual(true)
    expect(existsSync(filepathC)).toEqual(true)

    mkdirsIfNotExists(dirpathA, true)
    expect(existsSync(dirpathA)).toEqual(true)

    await emptyDir(fictitiousDir, false)
    expect(existsSync(fictitiousDir)).toEqual(true)
    expect(existsSync(dirpathA)).toEqual(false)
    expect(existsSync(dirpathB)).toEqual(false)
    expect(existsSync(filepathA)).toEqual(false)
    expect(existsSync(filepathB)).toEqual(false)
    expect(existsSync(filepathC)).toEqual(false)
  })

  it('reporter', async () => {
    const reporter = new Reporter(chalk, {
      level: ReporterLevelEnum.VERBOSE,
      flights: { colorful: false },
    })
    const reporterMock = createReporterMock({ reporter, desensitize })

    await emptyDir(fictitiousDir, undefined, reporter)
    await emptyDir(fictitiousDir, false, reporter)
    await emptyDir(fictitiousDir, true, reporter)

    expect(reporterMock.getIndiscriminateAll()).toMatchInlineSnapshot(`
      [
        [
          "verb  [] empty: <$WORKSPACE$>/packages/fs/__test__/fixtures/fictitiousDir_c4266163b919b
      ",
        ],
        [
          "verb  [] empty: <$WORKSPACE$>/packages/fs/__test__/fixtures/fictitiousDir_c4266163b919b
      ",
        ],
      ]
    `)
    reporterMock.restore()
  })
})

describe('ensureCriticalFilepathExistsSync', () => {
  it('null / undefined', () => {
    expect(() => void ensureCriticalFilepathExistsSync(null)).toThrow(
      'Invariant failed: Invalid path: null.',
    )
  })

  it('not found', () => {
    expect(
      () =>
        void ensureCriticalFilepathExistsSync(locateFixtures('basic/config.json-non-existed---22')),
    ).toThrow('Invariant failed: Not found:')
  })

  it('not a file', () => {
    expect(() => void ensureCriticalFilepathExistsSync(locateFixtures('basic/'))).toThrow(
      'Invariant failed: Not a file:',
    )
  })

  it('valid', () => {
    expect(
      () => void ensureCriticalFilepathExistsSync(locateFixtures('basic/config.yml')),
    ).not.toThrow()
  })
})

describe('mkdirsIfNotExists', () => {
  it('directory existed', () => {
    const dirpath = locateFixtures('basic')
    expect(existsSync(dirpath)).toBe(true)
    mkdirsIfNotExists(dirpath, true)
    expect(existsSync(dirpath)).toBe(true)
  })

  it('filepath', () => {
    const dirpath = locateFixtures('basic/config.yml')
    expect(existsSync(dirpath)).toBe(true)
    mkdirsIfNotExists(dirpath, false)
    expect(existsSync(dirpath)).toBe(true)
  })

  it('mkdirs', async () => {
    const dirpath = locateFixtures('basic--non-existed')
    expect(existsSync(dirpath)).toBe(false)
    mkdirsIfNotExists(dirpath, true)
    expect(existsSync(dirpath)).toBe(true)
    await rm(dirpath)
  })

  it('mkdirs reporter', async () => {
    const reporter = new Reporter(chalk, {
      level: ReporterLevelEnum.VERBOSE,
      flights: { colorful: false },
    })
    const reporterMock = createReporterMock({ reporter, desensitize })

    const dirpath = locateFixtures('basic--non-existed--2')
    expect(existsSync(dirpath)).toBe(false)
    mkdirsIfNotExists(dirpath, true, reporter)
    expect(existsSync(dirpath)).toBe(true)

    await rm(dirpath)

    expect(reporterMock.getIndiscriminateAll()).toMatchInlineSnapshot(`
      [
        [
          "verb  [] mkdirs: <$WORKSPACE$>/packages/fs/__test__/fixtures/basic--non-existed--2
      ",
        ],
      ]
    `)
    reporterMock.restore()
  })
})
