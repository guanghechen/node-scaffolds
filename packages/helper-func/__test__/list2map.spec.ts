import { list2map } from '../src'

interface IStudent {
  name: string
  age: number
}

describe('list2map', () => {
  describe('object list', () => {
    const students: IStudent[] = [
      { name: 'alice', age: 20 },
      { name: 'bob', age: 20 },
      { name: 'tom', age: 12 },
      { name: 'jerry', age: 11 },
    ]

    test('basic', () => {
      expect(Array.from(list2map(students, item => item.name))).toEqual([
        ['alice', { name: 'alice', age: 20 }],
        ['bob', { name: 'bob', age: 20 }],
        ['tom', { name: 'tom', age: 12 }],
        ['jerry', { name: 'jerry', age: 11 }],
      ])
    })

    test('duplicated', () => {
      expect(Array.from(list2map(students, item => item.age))).toEqual([
        [20, { name: 'bob', age: 20 }],
        [12, { name: 'tom', age: 12 }],
        [11, { name: 'jerry', age: 11 }],
      ])
    })

    test('index', () => {
      expect(Array.from(list2map(students, (_item, index) => index))).toEqual([
        [0, { name: 'alice', age: 20 }],
        [1, { name: 'bob', age: 20 }],
        [2, { name: 'tom', age: 12 }],
        [3, { name: 'jerry', age: 11 }],
      ])
    })
  })
})
