import fs from 'fs-extra'
import { desensitize, locateFixtures, unlinkSync } from 'jest.setup'
import {
  BigFileHelper,
  bigFileHelper,
  calcFilePartItemsByCount,
  calcFilePartItemsBySize,
} from '../src'

describe('calcFilePartItemsByCount', function () {
  test('basic', function () {
    const filepath = locateFixtures('a.md')
    expect(calcFilePartItemsByCount(filepath, 4)).toMatchSnapshot()
  })
})

describe('calcFilePartItemsBySize', function () {
  test('basic', function () {
    const filepath = locateFixtures('a.md')
    expect(calcFilePartItemsBySize(filepath, 1024)).toMatchSnapshot()
  })
})

describe('BigFileHelper', function () {
  const filepath = locateFixtures('a.md')
  const outputFilepath = filepath + Math.random()
  const parts = calcFilePartItemsByCount(filepath, 5)
  const partFilepaths = bigFileHelper.calcPartFilepaths(filepath, parts)
  const originalContent = fs.readFileSync(filepath, bigFileHelper.encoding)

  afterEach(() => {
    unlinkSync(outputFilepath, partFilepaths)
  })

  describe('calcPartFilepaths', function () {
    test('basic', function () {
      expect(desensitize(partFilepaths)).toMatchSnapshot()
      expect(bigFileHelper.calcPartFilepaths(filepath, [])).toEqual([filepath])
      expect(bigFileHelper.calcPartFilepaths(filepath, [{} as any])).toEqual([filepath])
    })

    test('custom part name', function () {
      const fileHelper = new BigFileHelper({ partSuffix: '.fun' })
      const funPartFilepaths = fileHelper.calcPartFilepaths(filepath, parts)
      expect(desensitize(funPartFilepaths)).toMatchSnapshot()
    })
  })

  test('split', async function () {
    for (const filepath of partFilepaths) {
      expect(fs.existsSync(filepath)).toBe(false)
    }

    expect(await bigFileHelper.split(filepath, [])).toEqual([filepath])
    for (const filepath of partFilepaths) {
      expect(fs.existsSync(filepath)).toBe(false)
    }

    expect(await bigFileHelper.split(filepath, parts)).toEqual(partFilepaths)

    for (const filepath of partFilepaths) {
      expect(fs.existsSync(filepath)).toBe(true)
    }
  })

  test('merge', async function () {
    for (const filepath of partFilepaths) {
      expect(fs.existsSync(filepath)).toBe(false)
    }

    expect(fs.existsSync(outputFilepath)).toBe(false)
    expect(await bigFileHelper.split(filepath, parts)).toEqual(partFilepaths)

    for (const filepath of partFilepaths) {
      expect(fs.existsSync(filepath)).toBe(true)
    }

    await bigFileHelper.merge(partFilepaths, outputFilepath)
    expect(fs.existsSync(outputFilepath)).toBe(true)
    expect(fs.readFileSync(outputFilepath, bigFileHelper.encoding)).toEqual(originalContent)
  })
})
