import { stripAnsi } from '../src'

describe('stripAnsi', () => {
  test('basic', () => {
    expect(stripAnsi('[32mHello, world![39m')).toEqual('Hello, world!')
  })
})
