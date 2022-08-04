import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { createLoggerMock } from '@guanghechen/helper-jest'
import fs from 'fs-extra'
import { desensitize, locateFixtures } from 'jest.helper'
import {
  collectAllFiles,
  collectAllFilesSync,
  ensureCriticalFilepathExistsSync,
  isDirectorySync,
  isFileSync,
  isNonExistentOrEmpty,
  mkdirsIfNotExists,
} from '../src'

describe('isFileSync', function () {
  test('truthy', function () {
    expect(isFileSync(locateFixtures('basic/config.yml'))).toBe(true)
  })

  test('falsy', function () {
    expect(isFileSync(locateFixtures('basic/config.yml-non-exist'))).toBe(false)
    expect(isFileSync(locateFixtures('basic'))).toBe(false)
    expect(isFileSync(null)).toBe(false)
    expect(isFileSync(undefined as any)).toBe(false)
  })
})

describe('isDirectorySync', function () {
  test('truthy', function () {
    expect(isDirectorySync(locateFixtures('basic'))).toBe(true)
  })

  test('falsy', function () {
    expect(isDirectorySync(locateFixtures('basic/config.yml'))).toBe(false)
    expect(isDirectorySync(locateFixtures('basic-non-exist'))).toBe(false)
    expect(isDirectorySync(null)).toBe(false)
    expect(isDirectorySync(undefined as any)).toBe(false)
  })
})

describe('isNonExistentOrEmpty', function () {
  test('truthy', function () {
    expect(isNonExistentOrEmpty(locateFixtures('basic-non-exist'))).toBe(true)
    expect(isNonExistentOrEmpty(locateFixtures('basic/config.yml-non-exist'))).toBe(true)
  })

  test('falsy', function () {
    expect(isNonExistentOrEmpty(locateFixtures('basic'))).toBe(false)
    expect(isNonExistentOrEmpty(locateFixtures('basic/config.yml'))).toBe(false)
    expect(isNonExistentOrEmpty(null)).toBe(false)
    expect(isNonExistentOrEmpty(undefined as any)).toBe(false)
  })
})

describe('mkdirsIfNotExists', function () {
  test('directory existed', function () {
    const dirpath = locateFixtures('basic')
    expect(fs.existsSync(dirpath)).toBe(true)
    mkdirsIfNotExists(dirpath, true)
    expect(fs.existsSync(dirpath)).toBe(true)
  })

  test('filepath', function () {
    const dirpath = locateFixtures('basic/config.yml')
    expect(fs.existsSync(dirpath)).toBe(true)
    mkdirsIfNotExists(dirpath, false)
    expect(fs.existsSync(dirpath)).toBe(true)
  })

  test('mkdirs', function () {
    const dirpath = locateFixtures('basic--non-existed')
    expect(fs.existsSync(dirpath)).toBe(false)
    mkdirsIfNotExists(dirpath, true)
    expect(fs.existsSync(dirpath)).toBe(true)
    fs.rmdirSync(dirpath)
  })

  test('mkdirs logger', function () {
    const logger = new ChalkLogger({
      level: Level.VERBOSE,
      flags: {
        colorful: false,
      },
    })
    const loggerMock = createLoggerMock({ logger, desensitize })

    const dirpath = locateFixtures('basic--non-existed--2')
    expect(fs.existsSync(dirpath)).toBe(false)
    mkdirsIfNotExists(dirpath, true, logger)
    expect(fs.existsSync(dirpath)).toBe(true)
    fs.rmdirSync(dirpath)

    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
    loggerMock.restore()
  })
})

describe('ensureCriticalFilepathExistsSync', function () {
  test('null / undefined', function () {
    expect(() => void ensureCriticalFilepathExistsSync(null)).toThrow(
      'Invariant failed: Invalid path: null.',
    )
  })

  test('not found', function () {
    expect(
      () =>
        void ensureCriticalFilepathExistsSync(locateFixtures('basic/config.json-non-existed---22')),
    ).toThrow('Invariant failed: Not found:')
  })

  test('not a file', function () {
    expect(() => void ensureCriticalFilepathExistsSync(locateFixtures('basic/'))).toThrow(
      'Invariant failed: Not a file:',
    )
  })

  test('valid', function () {
    expect(
      () => void ensureCriticalFilepathExistsSync(locateFixtures('basic/config.yml')),
    ).not.toThrow()
  })
})

describe('collectAllFiles', function () {
  test('default predicate', async function () {
    expect(desensitize(await collectAllFiles(locateFixtures('basic')))).toMatchSnapshot()
  })

  test('yaml file only', async function () {
    expect(
      desensitize(await collectAllFiles(locateFixtures('basic'), p => /\.(?:yml|yaml)$/.test(p))),
    ).toMatchSnapshot()

    expect(
      desensitize(
        await collectAllFiles(locateFixtures('basic'), p =>
          Promise.resolve(/\.(?:yml|yaml)$/.test(p)),
        ),
      ),
    ).toMatchSnapshot()
  })

  test('collect start from file', async function () {
    expect(desensitize(await collectAllFiles(locateFixtures('basic/config.yml')))).toMatchSnapshot()
  })
})

describe('collectAllFilesSync', function () {
  test('default predicate', function () {
    expect(desensitize(collectAllFilesSync(locateFixtures('basic')))).toMatchSnapshot()
  })

  test('yaml file only', function () {
    expect(
      desensitize(collectAllFilesSync(locateFixtures('basic'), p => /\.(?:yml|yaml)$/.test(p))),
    ).toMatchSnapshot()
  })

  test('collect start from file', function () {
    expect(desensitize(collectAllFilesSync(locateFixtures('basic/config.yml')))).toMatchSnapshot()
  })
})
