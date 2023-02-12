import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { createLoggerMock } from '@guanghechen/helper-jest'
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

  test('logger', async () => {
    const logger = new ChalkLogger({
      level: Level.VERBOSE,
      flights: {
        colorful: false,
      },
    })
    const loggerMock = createLoggerMock({ logger, desensitize })

    await emptyDir(fictitiousDir, undefined, logger)
    await emptyDir(fictitiousDir, false, logger)
    await emptyDir(fictitiousDir, true, logger)

    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
    loggerMock.restore()
  })
})

describe('ensureCriticalFilepathExistsSync', () => {
  test('null / undefined', () => {
    expect(() => void ensureCriticalFilepathExistsSync(null)).toThrow(
      'Invariant failed: Invalid path: null.',
    )
  })

  test('not found', () => {
    expect(
      () =>
        void ensureCriticalFilepathExistsSync(locateFixtures('basic/config.json-non-existed---22')),
    ).toThrow('Invariant failed: Not found:')
  })

  test('not a file', () => {
    expect(() => void ensureCriticalFilepathExistsSync(locateFixtures('basic/'))).toThrow(
      'Invariant failed: Not a file:',
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

  test('mkdirs logger', async () => {
    const logger = new ChalkLogger({
      level: Level.VERBOSE,
      flights: {
        colorful: false,
      },
    })
    const loggerMock = createLoggerMock({ logger, desensitize })

    const dirpath = locateFixtures('basic--non-existed--2')
    expect(existsSync(dirpath)).toBe(false)
    mkdirsIfNotExists(dirpath, true, logger)
    expect(existsSync(dirpath)).toBe(true)

    await rm(dirpath)

    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
    loggerMock.restore()
  })
})
