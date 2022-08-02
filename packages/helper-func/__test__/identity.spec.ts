import { identity, identityAsync } from '../src'

describe('identity', function () {
  test('basic', function () {
    expect(identity('some value')).toEqual('some value')
  })
})

describe('identityAsync', function () {
  test('basic', async function () {
    expect(await identityAsync('some value')).toEqual('some value')
    expect(await identityAsync(Promise.resolve('some value'))).toEqual('some value')
  })
})
