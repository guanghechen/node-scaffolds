import { locateFixtures } from 'jest.helper'
import { isDirectorySync, isFileSync, isNonExistentOrEmpty } from '../src'

describe('isFileSync', () => {
  it('truthy', () => {
    expect(isFileSync(locateFixtures('basic/config.yml'))).toBe(true)
  })

  it('falsy', () => {
    expect(isFileSync(locateFixtures('basic/config.yml-non-exist'))).toBe(false)
    expect(isFileSync(locateFixtures('basic'))).toBe(false)
    expect(isFileSync(null)).toBe(false)
    expect(isFileSync(undefined as any)).toBe(false)
  })
})

describe('isDirectorySync', () => {
  it('truthy', () => {
    expect(isDirectorySync(locateFixtures('basic'))).toBe(true)
  })

  it('falsy', () => {
    expect(isDirectorySync(locateFixtures('basic/config.yml'))).toBe(false)
    expect(isDirectorySync(locateFixtures('basic-non-exist'))).toBe(false)
    expect(isDirectorySync(null)).toBe(false)
    expect(isDirectorySync(undefined as any)).toBe(false)
  })
})

describe('isNonExistentOrEmpty', () => {
  it('truthy', () => {
    expect(isNonExistentOrEmpty(locateFixtures('basic-non-exist'))).toBe(true)
    expect(isNonExistentOrEmpty(locateFixtures('basic/config.yml-non-exist'))).toBe(true)
  })

  it('falsy', () => {
    expect(isNonExistentOrEmpty(locateFixtures('basic'))).toBe(false)
    expect(isNonExistentOrEmpty(locateFixtures('basic/config.yml'))).toBe(false)
    expect(isNonExistentOrEmpty(null)).toBe(false)
    expect(isNonExistentOrEmpty(undefined as any)).toBe(false)
  })
})
