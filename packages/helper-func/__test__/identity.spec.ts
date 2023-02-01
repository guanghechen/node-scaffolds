import { identity, identityAsync } from '../src'

describe('identity', () => {
  test('basic', () => {
    expect(identity('some value')).toEqual('some value')
  })
})

describe('identityAsync', () => {
  test('basic', async () => {
    expect(await identityAsync('some value')).toEqual('some value')
    expect(await identityAsync(Promise.resolve('some value'))).toEqual('some value')
  })
})
