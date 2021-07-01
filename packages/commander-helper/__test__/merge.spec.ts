import { defaultMergeStrategies, merge } from '../src'

describe('defaultMergeStrategies', function () {
  const prevOptions: any = {
    a: {
      b: {
        c: 'txt',
      },
    },
    b: 'dfe',
    c: ['x', 'y'],
  }

  test('replace', function () {
    expect(
      defaultMergeStrategies.replace(prevOptions, {
        a: {
          b: {
            d: 'waw',
          },
        },
        d: 'dfe',
      }),
    ).toEqual({
      a: {
        b: {
          d: 'waw',
        },
      },
      d: 'dfe',
    })

    expect(defaultMergeStrategies.replace(prevOptions, null)).toEqual(
      prevOptions,
    )

    expect(defaultMergeStrategies.replace(prevOptions, undefined)).toEqual(
      prevOptions,
    )
  })

  test('retain', function () {
    expect(
      defaultMergeStrategies.retain(prevOptions, {
        a: {
          b: {
            d: 'waw',
          },
        },
        d: 'dfe',
      }),
    ).toEqual(prevOptions)

    expect(defaultMergeStrategies.retain(prevOptions, null)).toEqual(
      prevOptions,
    )

    expect(defaultMergeStrategies.retain(prevOptions, undefined)).toEqual(
      prevOptions,
    )
  })

  test('concat', function () {
    expect(defaultMergeStrategies.concat(prevOptions, { a: 1 } as any)).toEqual(
      prevOptions,
    )

    expect(defaultMergeStrategies.concat(['a', 'b'], ['c'])).toEqual([
      'a',
      'b',
      'c',
    ])

    expect(defaultMergeStrategies.concat(['a', 'b'], [])).toEqual(['a', 'b'])

    expect(defaultMergeStrategies.concat([], ['a', 'b'])).toEqual(['a', 'b'])
  })

  test('assign', function () {
    expect(
      defaultMergeStrategies.assign(prevOptions, {
        a: {
          b: {
            d: 'waw',
          },
        },
        d: 'dfe',
      }),
    ).toEqual({
      a: {
        b: {
          d: 'waw',
        },
      },
      b: 'dfe',
      c: ['x', 'y'],
      d: 'dfe',
    })

    expect(defaultMergeStrategies.assign(prevOptions, null)).toEqual({
      a: {
        b: {
          c: 'txt',
        },
      },
      b: 'dfe',
      c: ['x', 'y'],
    })
  })
})

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
    },
  ]

  test('replace', function () {
    expect(
      merge(options, {
        a: defaultMergeStrategies.assign,
        b: defaultMergeStrategies.retain,
        c: defaultMergeStrategies.concat,
      }),
    ).toMatchSnapshot()

    expect(merge(options)).toMatchSnapshot()
  })
})
