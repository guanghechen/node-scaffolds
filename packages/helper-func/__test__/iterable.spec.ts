import { filterIterable, mapIterable } from '../src'

describe('filterIterable', () => {
  test('array', () => {
    expect(filterIterable([1, 2, 3, 4, 5], x => x * x > 9)).toEqual([4, 5])
    expect(filterIterable([1, 2, 3, 4, 5], (x, i) => (i & 1) === 0 && x > 1)).toEqual([3, 5])
  })

  test('iterable', () => {
    expect(
      filterIterable(new Set<number>([1, 2, 3, 4, 5]), x => x * x > 9).sort((x, y) => x - y),
    ).toEqual([4, 5])
    expect(
      filterIterable(new Set<number>([1, 2, 3, 4, 5]), (x, i) => (i & 1) === 0 && x > 1).sort(
        (x, y) => x - y,
      ),
    ).toEqual([3, 5])
  })
})

describe('mapIterable', () => {
  test('array', () => {
    expect(mapIterable<number, number>([1, 2, 3, 4, 5], x => x * x)).toEqual([1, 4, 9, 16, 25])
    expect(mapIterable<number, number>([1, 2, 3, 4, 5], (x, i) => i * 10 + x)).toEqual([
      1, 12, 23, 34, 45,
    ])
  })

  test('iterable', () => {
    expect(
      mapIterable<number, number>(new Set<number>([1, 2, 3, 4, 5]), x => x * x).sort(
        (x, y) => x - y,
      ),
    ).toEqual([1, 4, 9, 16, 25])
    expect(
      mapIterable<number, number>(new Set<number>([1, 2, 3, 4, 5]), (x, i) => i * 10 + x).sort(
        (x, y) => x - y,
      ),
    ).toEqual([1, 12, 23, 34, 45])
  })
})
