import { noop, noopAsync } from '../src'

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

describe('noopAsync', () => {
  test('no params', async () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(await noopAsync()).toBeUndefined()
  })

  test('with params', async () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(await noopAsync('some value', 3, 'x')).toBeUndefined()
  })
})
