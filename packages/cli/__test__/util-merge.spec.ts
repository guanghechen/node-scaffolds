import { isNotEmptyArray, isNotEmptyObject } from '@guanghechen/std'
import { merge } from '../src'

describe('merge', function () {
  const options: any[] = [
    {
      a: {
        b: {
          c: 'txt',
        },
      },
      b: 'dfe',
      c: ['x', 'y'],
      d: 'd',
    },
    {
      a: {
        b: {
          d: 'waw',
        },
      },
      c: ['a', 'b'],
      d: null,
    },
  ]

  test('replace', function () {
    expect(
      merge(options, {
        a: (prevValue, nextValue) =>
          isNotEmptyObject(nextValue)
            ? isNotEmptyObject(prevValue)
              ? { ...prevValue, ...nextValue }
              : nextValue
            : prevValue, // assign
        b: prevValue => prevValue, // retain
        c: (prevValue: unknown[], nextValue: unknown[]): unknown[] =>
          isNotEmptyArray(nextValue) && isNotEmptyArray(prevValue)
            ? [...prevValue, ...nextValue]
            : nextValue, // concat
      }),
    ).toMatchInlineSnapshot(`
      {
        "a": {
          "b": {
            "d": "waw",
          },
        },
        "b": "dfe",
        "c": [
          "x",
          "y",
          "a",
          "b",
        ],
        "d": "d",
      }
    `)

    expect(merge(options)).toMatchInlineSnapshot(`
      {
        "a": {
          "b": {
            "d": "waw",
          },
        },
        "b": "dfe",
        "c": [
          "a",
          "b",
        ],
        "d": "d",
      }
    `)
  })
})
