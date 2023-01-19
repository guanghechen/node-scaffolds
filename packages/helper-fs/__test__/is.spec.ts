import { locateFixtures } from 'jest.helper'
import { isDirectorySync, isFileSync, isNonExistentOrEmpty } from '../src'

describe('isFileSync', () => {
  test('truthy', () => {
    expect(isFileSync(locateFixtures('basic/config.yml'))).toBe(true)
  })

  test('falsy', () => {
    expect(isFileSync(locateFixtures('basic/config.yml-non-exist'))).toBe(false)
    expect(isFileSync(locateFixtures('basic'))).toBe(false)
    expect(isFileSync(null)).toBe(false)
    expect(isFileSync(undefined as any)).toBe(false)
  })
})

describe('isDirectorySync', () => {
  test('truthy', () => {
    expect(isDirectorySync(locateFixtures('basic'))).toBe(true)
  })

  test('falsy', () => {
    expect(isDirectorySync(locateFixtures('basic/config.yml'))).toBe(false)
    expect(isDirectorySync(locateFixtures('basic-non-exist'))).toBe(false)
    expect(isDirectorySync(null)).toBe(false)
    expect(isDirectorySync(undefined as any)).toBe(false)
  })
})

describe('isNonExistentOrEmpty', () => {
  test('truthy', () => {
    expect(isNonExistentOrEmpty(locateFixtures('basic-non-exist'))).toBe(true)
    expect(isNonExistentOrEmpty(locateFixtures('basic/config.yml-non-exist'))).toBe(true)
  })

  test('falsy', () => {
    expect(isNonExistentOrEmpty(locateFixtures('basic'))).toBe(false)
    expect(isNonExistentOrEmpty(locateFixtures('basic/config.yml'))).toBe(false)
    expect(isNonExistentOrEmpty(null)).toBe(false)
    expect(isNonExistentOrEmpty(undefined as any)).toBe(false)
  })
})
