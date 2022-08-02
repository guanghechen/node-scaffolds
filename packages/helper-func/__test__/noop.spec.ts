import { noop, noopAsync } from '../src'

describe('noop', function () {
  test('no params', function () {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(noop()).toBeUndefined()
  })

  test('with params', function () {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(noop('some value', 2, 3)).toBeUndefined()
  })
})

describe('noopAsync', function () {
  test('no params', async function () {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(await noopAsync()).toBeUndefined()
  })

  test('with params', async function () {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(await noopAsync('some value', 3, 'x')).toBeUndefined()
  })
})
