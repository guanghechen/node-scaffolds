import { delay } from '../src'

describe('delay', function () {
  test('basic', async function () {
    const currentTime = Date.now()
    const duration = 500
    await delay(duration)
    expect(Date.now() - currentTime + 2).toBeGreaterThanOrEqual(duration)
  })
})
