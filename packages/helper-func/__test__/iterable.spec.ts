import { filterIterable, iterable2map, mapIterable } from '../src'

describe('filterIterable', () => {
  it('array', () => {
    expect(filterIterable([1, 2, 3, 4, 5], x => x * x > 9)).toEqual([4, 5])
    expect(filterIterable([1, 2, 3, 4, 5], (x, i) => (i & 1) === 0 && x > 1)).toEqual([3, 5])
  })

  it('iterable', () => {
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
  it('array', () => {
    expect(mapIterable<number, number>([1, 2, 3, 4, 5], x => x * x)).toEqual([1, 4, 9, 16, 25])
    expect(mapIterable<number, number>([1, 2, 3, 4, 5], (x, i) => i * 10 + x)).toEqual([
      1, 12, 23, 34, 45,
    ])
  })

  it('iterable', () => {
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

describe('iterable2map', () => {
  interface IStudent {
    name: string
    age: number
  }

  describe('object list', () => {
    const students: IStudent[] = [
      { name: 'alice', age: 20 },
      { name: 'bob', age: 20 },
      { name: 'tom', age: 12 },
      { name: 'jerry', age: 11 },
    ]

    it('basic', () => {
      expect(Array.from(iterable2map(students, item => item.name))).toEqual([
        ['alice', { name: 'alice', age: 20 }],
        ['bob', { name: 'bob', age: 20 }],
        ['tom', { name: 'tom', age: 12 }],
        ['jerry', { name: 'jerry', age: 11 }],
      ])
    })

    it('duplicated', () => {
      expect(Array.from(iterable2map(students, item => item.age))).toEqual([
        [20, { name: 'bob', age: 20 }],
        [12, { name: 'tom', age: 12 }],
        [11, { name: 'jerry', age: 11 }],
      ])
    })

    it('index', () => {
      expect(Array.from(iterable2map(students, (_item, index) => index))).toEqual([
        [0, { name: 'alice', age: 20 }],
        [1, { name: 'bob', age: 20 }],
        [2, { name: 'tom', age: 12 }],
        [3, { name: 'jerry', age: 11 }],
      ])
    })
  })
})
