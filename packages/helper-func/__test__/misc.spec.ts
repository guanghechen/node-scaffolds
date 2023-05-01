import { falsy, identity, noop, truthy } from '../src'

describe('falsy', () => {
  test('no params', () => {
    expect(falsy()).toEqual(false)
  })

  test('with params', () => {
    expect(falsy('some value', 2, 3)).toEqual(false)
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

describe('identity', () => {
  test('basic', () => {
    expect(identity('some value')).toEqual('some value')
  })
})

describe('noop', () => {
  test('no params', () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(noop()).toBeUndefined()
  })

  test('with params', () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(noop('some value', 2, 3)).toBeUndefined()
  })
})
