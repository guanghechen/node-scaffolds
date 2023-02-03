import { locateFixtures } from 'jest.helper'
import { readFileSync } from 'node:fs'
import type { IFilePartItem } from '../src'
import { calcFilePartItemsByCount, calcFilePartItemsBySize, calcFilePartNames } from '../src'

describe('util', () => {
  const encoding: BufferEncoding = 'utf8'
  const contentA = 'Hello, A.'
  const contentB = 'Hello, B.'.repeat(35)
  const contentC = 'Hello, C.'.repeat(750)
  const contentD = 'Hello, D.'.repeat(1350)
  const contentE = ''
  const contentF: string = readFileSync(locateFixtures('f.md'), encoding)
  const contentG: string = readFileSync(locateFixtures('g.md'), encoding)

  test('calcFilePartItemsBySize', () => {
    expect(() => calcFilePartItemsBySize(100, 0)).toThrow('Part size should be a positive integer!')
    expect(() => calcFilePartItemsBySize(100, Number.NEGATIVE_INFINITY)).toThrow(
      'Part size should be a positive integer!',
    )

    expect(calcFilePartItemsBySize(100, Number.POSITIVE_INFINITY)).toEqual([
      { sid: 1, start: 0, end: 100 },
    ])
    expect(calcFilePartItemsBySize(contentA.length, 1024)).toEqual([{ sid: 1, start: 0, end: 9 }])
    expect(calcFilePartItemsBySize(contentB.length, 1024)).toEqual([{ sid: 1, start: 0, end: 315 }])
    expect(calcFilePartItemsBySize(contentC.length, 1024)).toEqual([
      { sid: 1, start: 0, end: 1024 },
      { sid: 2, start: 1024, end: 2048 },
      { sid: 3, start: 2048, end: 3072 },
      { sid: 4, start: 3072, end: 4096 },
      { sid: 5, start: 4096, end: 5120 },
      { sid: 6, start: 5120, end: 6144 },
      { sid: 7, start: 6144, end: 6750 },
    ])
    expect(calcFilePartItemsBySize(contentD.length, 1024)).toEqual([
      { sid: 1, start: 0, end: 1024 },
      { sid: 2, start: 1024, end: 2048 },
      { sid: 3, start: 2048, end: 3072 },
      { sid: 4, start: 3072, end: 4096 },
      { sid: 5, start: 4096, end: 5120 },
      { sid: 6, start: 5120, end: 6144 },
      { sid: 7, start: 6144, end: 7168 },
      { sid: 8, start: 7168, end: 8192 },
      { sid: 9, start: 8192, end: 9216 },
      { sid: 10, start: 9216, end: 10240 },
      { sid: 11, start: 10240, end: 11264 },
      { sid: 12, start: 11264, end: 12150 },
    ])
    expect(calcFilePartItemsBySize(contentE.length, 1024)).toEqual([{ sid: 1, start: 0, end: 0 }])
    expect(calcFilePartItemsBySize(contentF.length, 1024)).toEqual([
      { sid: 1, start: 0, end: 1024 },
      { sid: 2, start: 1024, end: 2048 },
      { sid: 3, start: 2048, end: 3072 },
      { sid: 4, start: 3072, end: 4096 },
      { sid: 5, start: 4096, end: 5120 },
      { sid: 6, start: 5120, end: 5395 },
    ])
    expect(calcFilePartItemsBySize(contentG.length, 1024)).toEqual([{ sid: 1, start: 0, end: 0 }])
  })

  test('calcFilePartItemsByCount', () => {
    expect(() => calcFilePartItemsByCount(100, 0)).toThrow(
      'Total of part should be a positive integer!',
    )
    expect(() => calcFilePartItemsByCount(100, Number.NEGATIVE_INFINITY)).toThrow(
      'Total of part should be a positive integer!',
    )

    expect(calcFilePartItemsByCount(contentA.length, 1)).toEqual([{ sid: 1, start: 0, end: 9 }])
    expect(calcFilePartItemsByCount(contentB.length, 3)).toEqual([
      { sid: 1, start: 0, end: 105 },
      { sid: 2, start: 105, end: 210 },
      { sid: 3, start: 210, end: 315 },
    ])
    expect(calcFilePartItemsByCount(contentC.length, 7)).toEqual([
      { sid: 1, start: 0, end: 965 },
      { sid: 2, start: 965, end: 1930 },
      { sid: 3, start: 1930, end: 2895 },
      { sid: 4, start: 2895, end: 3860 },
      { sid: 5, start: 3860, end: 4825 },
      { sid: 6, start: 4825, end: 5790 },
      { sid: 7, start: 5790, end: 6750 },
    ])
    expect(calcFilePartItemsByCount(contentD.length, 8)).toEqual([
      { sid: 1, start: 0, end: 1519 },
      { sid: 2, start: 1519, end: 3038 },
      { sid: 3, start: 3038, end: 4557 },
      { sid: 4, start: 4557, end: 6076 },
      { sid: 5, start: 6076, end: 7595 },
      { sid: 6, start: 7595, end: 9114 },
      { sid: 7, start: 9114, end: 10633 },
      { sid: 8, start: 10633, end: 12150 },
    ])
    expect(calcFilePartItemsByCount(contentE.length, 2)).toEqual([{ sid: 1, start: 0, end: 0 }])
    expect(calcFilePartItemsByCount(contentF.length, 7)).toEqual([
      { sid: 1, start: 0, end: 771 },
      { sid: 2, start: 771, end: 1542 },
      { sid: 3, start: 1542, end: 2313 },
      { sid: 4, start: 2313, end: 3084 },
      { sid: 5, start: 3084, end: 3855 },
      { sid: 6, start: 3855, end: 4626 },
      { sid: 7, start: 4626, end: 5395 },
    ])
    expect(calcFilePartItemsByCount(contentG.length, 3)).toEqual([{ sid: 1, start: 0, end: 0 }])
  })

  test('calcFilePartNames', () => {
    // empty
    expect(calcFilePartNames([], '')).toEqual([])
    expect(calcFilePartNames([], '.part')).toEqual([])

    // single part
    expect(calcFilePartNames([{ sid: 1 }], '')).toEqual([''])
    expect(calcFilePartNames([{ sid: 1 }], '.part')).toEqual([''])

    // multiple part
    expect(calcFilePartNames([{ sid: 1 }, { sid: 2 }], '')).toEqual(['1', '2'])
    expect(calcFilePartNames([{ sid: 1 }, { sid: 2 }], '.part')).toEqual(['.part1', '.part2'])

    const parts: IFilePartItem[] = [
      { sid: 1, start: 0, end: 1024 },
      { sid: 2, start: 1024, end: 2048 },
      { sid: 3, start: 2048, end: 3072 },
      { sid: 4, start: 3072, end: 4096 },
      { sid: 5, start: 4096, end: 5120 },
      { sid: 6, start: 5120, end: 6144 },
      { sid: 7, start: 6144, end: 7168 },
      { sid: 8, start: 7168, end: 8192 },
      { sid: 9, start: 8192, end: 9216 },
      { sid: 10, start: 9216, end: 10240 },
      { sid: 11, start: 10240, end: 11264 },
      { sid: 12, start: 11264, end: 12150 },
    ]
    expect(calcFilePartNames(parts, '.part.')).toEqual([
      '.part.01',
      '.part.02',
      '.part.03',
      '.part.04',
      '.part.05',
      '.part.06',
      '.part.07',
      '.part.08',
      '.part.09',
      '.part.10',
      '.part.11',
      '.part.12',
    ])
  })
})
