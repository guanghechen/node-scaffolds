import { normalizeString } from '../src/format'

describe('normalizeString', () => {
  test('basic', () => {
    const suites = [
      [undefined, 'undefined'],
      [null, 'null'],
      [true, 'true'],
      [false, 'false'],
      [0, '0'],
      [-1, '-1'],
      [1.2, '1.2'],
      [[], '[]'],
      [{}, '{}'],
      ['', ''],
      ['Hello, world!', 'Hello, world!'],
    ]

    for (const inline of [true, false]) {
      for (const func of [true, false]) {
        for (const [input, answer] of suites) {
          expect([inline, func, normalizeString(func ? () => input : input, inline)]).toEqual([
            inline,
            func,
            answer,
          ])
        }
      }
    }
  })
})
