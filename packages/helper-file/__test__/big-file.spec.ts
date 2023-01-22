import { desensitize, locateFixtures, unlinkSync } from 'jest.helper'
import { existsSync, readFileSync, statSync } from 'node:fs'
import fs from 'node:fs/promises'
import {
  BigFileHelper,
  bigFileHelper,
  calcFilePartItemsByCount,
  calcFilePartItemsBySize,
} from '../src'

describe('calcFilePartItemsByCount', () => {
  test('basic', async () => {
    const filepath = locateFixtures('a.md')
    expect(
      calcFilePartItemsByCount(await fs.stat(filepath).then(md => md.size), 4),
    ).toMatchSnapshot()
  })

  test('empty file', async () => {
    const filepath = locateFixtures('b.md')
    expect(calcFilePartItemsByCount(await fs.stat(filepath).then(md => md.size), 1024)).toEqual([
      { sid: 1, start: 0, end: 0 },
    ])
  })
})

describe('calcFilePartItemsBySize', () => {
  test('basic', async () => {
    const filepath = locateFixtures('a.md')
    expect(
      calcFilePartItemsBySize(await fs.stat(filepath).then(md => md.size), 1024),
    ).toMatchSnapshot()
  })

  test('empty file', async () => {
    const filepath = locateFixtures('b.md')
    expect(calcFilePartItemsBySize(await fs.stat(filepath).then(md => md.size), 1024)).toEqual([
      { sid: 1, start: 0, end: 0 },
    ])
  })
})

describe('BigFileHelper', () => {
  const filepath = locateFixtures('a.md')
  const outputFilepath = filepath + Math.random()
  const parts = calcFilePartItemsByCount(statSync(filepath).size, 5)
  const partFilepaths = bigFileHelper.calcPartFilepaths(filepath, parts)
  const originalContent = readFileSync(filepath, bigFileHelper.encoding)

  afterEach(() => {
    unlinkSync(outputFilepath, partFilepaths)
  })

  describe('calcPartFilepaths', () => {
    test('basic', () => {
      expect(desensitize(partFilepaths)).toMatchSnapshot()
      expect(bigFileHelper.calcPartFilepaths(filepath, [])).toEqual([filepath])
      expect(bigFileHelper.calcPartFilepaths(filepath, [{} as any])).toEqual([filepath])
    })

    test('custom part name', () => {
      const fileHelper = new BigFileHelper({ partSuffix: '.fun' })
      const funPartFilepaths = fileHelper.calcPartFilepaths(filepath, parts)
      expect(desensitize(funPartFilepaths)).toMatchSnapshot()
    })
  })

  test('split', async () => {
    for (const filepath of partFilepaths) {
      expect(existsSync(filepath)).toBe(false)
    }

    expect(await bigFileHelper.split(filepath, [])).toEqual([filepath])
    for (const filepath of partFilepaths) {
      expect(existsSync(filepath)).toBe(false)
    }

    expect(await bigFileHelper.split(filepath, parts)).toEqual(partFilepaths)

    for (const filepath of partFilepaths) {
      expect(existsSync(filepath)).toBe(true)
    }
  })

  test('merge', async () => {
    for (const filepath of partFilepaths) {
      expect(existsSync(filepath)).toBe(false)
    }

    expect(existsSync(outputFilepath)).toBe(false)
    expect(await bigFileHelper.split(filepath, parts)).toEqual(partFilepaths)

    for (const filepath of partFilepaths) {
      expect(existsSync(filepath)).toBe(true)
    }

    await bigFileHelper.merge(partFilepaths, outputFilepath)
    expect(existsSync(outputFilepath)).toBe(true)
    expect(readFileSync(outputFilepath, bigFileHelper.encoding)).toEqual(originalContent)
  })
})
