import { delay, falsyAsync, identityAsync, noopAsync, truthyAsync } from '../src'

describe('falsyAsync', () => {
  it('no params', async () => {
    expect(await falsyAsync()).toEqual(false)
  })

  it('with params', async () => {
    expect(await falsyAsync('some value', 3, 'x')).toEqual(false)
  })
})

describe('truthyAsync', () => {
  it('no params', async () => {
    expect(await truthyAsync()).toEqual(true)
  })

  it('with params', async () => {
    expect(await truthyAsync('some value', 3, 'x')).toEqual(true)
  })
})

describe('identityAsync', () => {
  it('basic', async () => {
    expect(await identityAsync('some value')).toEqual('some value')
    expect(await identityAsync(Promise.resolve('some value'))).toEqual('some value')
  })
})

describe('noopAsync', () => {
  it('no params', async () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(await noopAsync()).toBeUndefined()
  })

  it('with params', async () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(await noopAsync('some value', 3, 'x')).toBeUndefined()
  })
})

describe('delay', () => {
  it('basic', async () => {
    const currentTime = Date.now()
    const duration = 500
    await delay(duration)
    expect(Date.now() - currentTime + 2).toBeGreaterThanOrEqual(duration)
  })
})
