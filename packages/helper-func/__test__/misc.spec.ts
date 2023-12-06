import { falsy, identity, noop, truthy } from '../src'

describe('falsy', () => {
  it('no params', () => {
    expect(falsy()).toEqual(false)
  })

  it('with params', () => {
    expect(falsy('some value', 2, 3)).toEqual(false)
  })
})

describe('truthy', () => {
  it('no params', () => {
    expect(truthy()).toEqual(true)
  })

  it('with params', () => {
    expect(truthy('some value', 2, 3)).toEqual(true)
  })
})

describe('identity', () => {
  it('basic', () => {
    expect(identity('some value')).toEqual('some value')
  })
})

describe('noop', () => {
  it('no params', () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(noop()).toBeUndefined()
  })

  it('with params', () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(noop('some value', 2, 3)).toBeUndefined()
  })
})
