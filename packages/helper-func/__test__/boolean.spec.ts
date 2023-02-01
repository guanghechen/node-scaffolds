import { falsy, falsyAsync, truthy, truthyAsync } from '../src'

describe('falsy', () => {
  test('no params', () => {
    expect(falsy()).toEqual(false)
  })

  test('with params', () => {
    expect(falsy('some value', 2, 3)).toEqual(false)
  })
})

describe('falsyAsync', () => {
  test('no params', async () => {
    expect(await falsyAsync()).toEqual(false)
  })

  test('with params', async () => {
    expect(await falsyAsync('some value', 3, 'x')).toEqual(false)
  })
})

describe('truthy', () => {
  test('no params', () => {
    expect(truthy()).toEqual(true)
  })

  test('with params', () => {
    expect(truthy('some value', 2, 3)).toEqual(true)
  })
})

describe('truthyAsync', () => {
  test('no params', async () => {
    expect(await truthyAsync()).toEqual(true)
  })

  test('with params', async () => {
    expect(await truthyAsync('some value', 3, 'x')).toEqual(true)
  })
})
