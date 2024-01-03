// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
  isFileSync,
  mkdirsIfNotExists,
  rm,
  writeFile,
} from '../src'

describe('empty', () => {
  const fictitiousDir = locateFixtures('fictitiousDir_c4266163b919b')

  afterEach(async () => {
    await rm(fictitiousDir)
  })

  test('basic', async () => {
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
    expect(isFileSync(filepathA)).toEqual(true)
    expect(isFileSync(filepathB)).toEqual(true)
    expect(isFileSync(filepathC)).toEqual(true)
    expect(isFileSync(dirpathA)).toEqual(false)
    expect(isFileSync(dirpathB)).toEqual(false)

    mkdirsIfNotExists(dirpathA, true)
    expect(existsSync(dirpathA)).toEqual(true)
    expect(isFileSync(filepathA)).toEqual(true)
    expect(isFileSync(filepathB)).toEqual(true)
    expect(isFileSync(filepathC)).toEqual(true)
    expect(isFileSync(dirpathA)).toEqual(false)
    expect(isFileSync(dirpathB)).toEqual(false)

    await emptyDir(fictitiousDir, false)
    expect(existsSync(fictitiousDir)).toEqual(true)
    expect(existsSync(dirpathA)).toEqual(false)
    expect(existsSync(dirpathB)).toEqual(false)
    expect(existsSync(filepathA)).toEqual(false)
    expect(existsSync(filepathB)).toEqual(false)
    expect(existsSync(filepathC)).toEqual(false)
    expect(isFileSync(filepathA)).toEqual(false)
    expect(isFileSync(filepathB)).toEqual(false)
    expect(isFileSync(filepathC)).toEqual(false)
    expect(isFileSync(dirpathA)).toEqual(false)
    expect(isFileSync(dirpathB)).toEqual(false)
  })

  test('reporter', async () => {
    const reporter = new Reporter(chalk, {
      level: ReporterLevelEnum.VERBOSE,
      flights: {
        colorful: false,
      },
    })
    const loggerMock = createReporterMock({ reporter, desensitize })

    await emptyDir(fictitiousDir, undefined, reporter)
    await emptyDir(fictitiousDir, false, reporter)
    await emptyDir(fictitiousDir, true, reporter)

    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
    loggerMock.restore()
  })
})

describe('ensureCriticalFilepathExistsSync', () => {
  test('null / undefined', () => {
    expect(() => void ensureCriticalFilepathExistsSync(null)).toThrow('Invalid path: null.')
  })

  test('not found', () => {
    expect(
      () =>
        void ensureCriticalFilepathExistsSync(locateFixtures('basic/config.json-non-existed---22')),
    ).toThrow('Not found:')
  })

  test('not a file', () => {
    expect(() => void ensureCriticalFilepathExistsSync(locateFixtures('basic/'))).toThrow(
      'Not a file:',
    )
  })

  test('valid', () => {
    expect(
      () => void ensureCriticalFilepathExistsSync(locateFixtures('basic/config.yml')),
    ).not.toThrow()
  })
})

describe('mkdirsIfNotExists', () => {
  test('directory existed', () => {
    const dirpath = locateFixtures('basic')
    expect(existsSync(dirpath)).toBe(true)
    mkdirsIfNotExists(dirpath, true)
    expect(existsSync(dirpath)).toBe(true)
  })

  test('filepath', () => {
    const dirpath = locateFixtures('basic/config.yml')
    expect(existsSync(dirpath)).toBe(true)
    mkdirsIfNotExists(dirpath, false)
    expect(existsSync(dirpath)).toBe(true)
  })

  test('mkdirs', async () => {
    const dirpath = locateFixtures('basic--non-existed')
    expect(existsSync(dirpath)).toBe(false)
    mkdirsIfNotExists(dirpath, true)
    expect(existsSync(dirpath)).toBe(true)
    await rm(dirpath)
  })

  test('mkdirs (with reporter)', async () => {
    const reporter = new Reporter(chalk, {
      level: ReporterLevelEnum.VERBOSE,
      flights: {
        colorful: false,
      },
    })
    const reporterMock = createReporterMock({ reporter, desensitize })

    const dirpath = locateFixtures('basic--non-existed--2')
    expect(existsSync(dirpath)).toBe(false)
    mkdirsIfNotExists(dirpath, true, reporter)
    expect(existsSync(dirpath)).toBe(true)

    await rm(dirpath)

    expect(reporterMock.getIndiscriminateAll()).toMatchSnapshot()
    reporterMock.restore()
  })
})
