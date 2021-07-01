import fs from 'fs-extra'
import { desensitize, locateFixtures } from 'jest.setup'
import { BigFileHelper, bigFileHelper, calcFilePartItemsByCount } from '../src'

describe('BigFileHelper', function () {
  const filepath = locateFixtures('a.md')
  const outputFilepath = filepath + Math.random()
  const parts = calcFilePartItemsByCount(filepath, 5)
  const partFilepaths = bigFileHelper.calcPartFilepaths(filepath, parts)

  afterEach(() => {
    if (fs.existsSync(outputFilepath)) fs.unlinkSync(outputFilepath)
    for (const filepath of partFilepaths) {
      if (!fs.existsSync(filepath)) continue
      fs.unlinkSync(filepath)
    }
  })

  describe('calcPartFilepaths', function () {
    test('basic', function () {
      expect(desensitize(partFilepaths)).toMatchSnapshot()
      expect(bigFileHelper.calcPartFilepaths(filepath, [])).toEqual([filepath])
      expect(bigFileHelper.calcPartFilepaths(filepath, [{} as any])).toEqual([
        filepath,
      ])
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
  })
})
