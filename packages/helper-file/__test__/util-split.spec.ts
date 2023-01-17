import type { IFilePartItem } from '../src'
import { calcFilePartNames } from '../src'

describe('calcFilePartNames', () => {
  test('empty', () => {
    expect(calcFilePartNames([], '')).toEqual([])
    expect(calcFilePartNames([], '.part')).toEqual([])
  })

  test('single part', () => {
    expect(calcFilePartNames([{ sid: 1 }], '')).toEqual([''])
    expect(calcFilePartNames([{ sid: 1 }], '.part')).toEqual([''])
  })

  test('multiple part', () => {
    expect(calcFilePartNames([{ sid: 1 }, { sid: 2 }], '')).toEqual(['1', '2'])

    expect(calcFilePartNames([{ sid: 1 }, { sid: 2 }], '.part')).toEqual(['.part1', '.part2'])

    const parts: IFilePartItem[] = [
      { sid: 1, start: 0, end: 50 },
      { sid: 2, start: 50, end: 100 },
      { sid: 3, start: 100, end: 150 },
      { sid: 4, start: 150, end: 200 },
      { sid: 5, start: 200, end: 250 },
      { sid: 6, start: 250, end: 300 },
      { sid: 7, start: 300, end: 350 },
      { sid: 8, start: 350, end: 400 },
      { sid: 9, start: 400, end: 450 },
      { sid: 10, start: 450, end: 500 },
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
    ])
  })
})
