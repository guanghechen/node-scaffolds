import { noop, sleep } from '../src'

describe('noop', function () {
  test('no params', function () {
    expect(noop()).toBeUndefined()
  })

  test('with params', function () {
    expect(noop('some value')).toEqual('some value')
  })
})

describe('sleep', function () {
  test('basic', async function () {
    const currentTime = Date.now()
    const duration = 500
    await sleep(duration)
    expect(Date.now() - currentTime + 2).toBeGreaterThanOrEqual(duration)
  })
})
