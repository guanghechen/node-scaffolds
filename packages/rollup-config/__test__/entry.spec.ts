import { resolveEntryItems } from '../src'

it('resolveEntryItems', () => {
  expect(
    resolveEntryItems({
      module: 'lib/esm/a.js',
      main: 'lib/cjs/a.js',
      source: 'src/index.ts',
      types: 'lib/types/index.d.ts',
    }),
  ).toMatchInlineSnapshot(`
      [
        {
          "import": "lib/esm/a.js",
          "require": "lib/cjs/a.js",
          "source": [
            "src/index.ts",
          ],
          "types": "lib/types/index.d.ts",
        },
      ]
    `)

  expect(
    resolveEntryItems({
      source: 'src/index.ts',
    }),
  ).toMatchInlineSnapshot('[]')

  expect(
    resolveEntryItems({
      source: 'src/index.ts',
      types: 'lib/types/index.d.ts',
    }),
  ).toMatchInlineSnapshot('[]')

  expect(
    resolveEntryItems({
      source: 'src/index.ts',
      types: 'lib/types/index.d.ts',
      exports: {
        import: 'lib/esm/a.js',
        require: 'lib/esm/a.js',
      },
    }),
  ).toMatchInlineSnapshot('[]')

  expect(
    resolveEntryItems({
      source: 'src/index.ts',
      exports: 'lib/esm/index.js',
    }),
  ).toMatchInlineSnapshot(`
    [
      {
        "import": "lib/esm/index.js",
        "require": undefined,
        "source": [
          "src/index.ts",
        ],
        "types": undefined,
      },
    ]
  `)

  expect(
    resolveEntryItems({
      source: 'src/index.ts',
      exports: {},
    }),
  ).toMatchInlineSnapshot('[]')

  expect(
    resolveEntryItems({
      source: 'src/index.ts',
      exports: {
        waw: {},
      },
    }),
  ).toMatchInlineSnapshot('[]')

  expect(
    resolveEntryItems({
      source: 'lib/index2.ts',
      exports: {
        '.': {
          import: 'lib/esm/index.mjs',
          require: 'lib/cjs/index.cjs',
          source: 'src/index.ts',
          types: 'lib/types/index.d.ts',
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    [
      {
        "import": "lib/esm/index.mjs",
        "require": "lib/cjs/index.cjs",
        "source": [
          "src/index.ts",
        ],
        "types": "lib/types/index.d.ts",
      },
    ]
  `)

  expect(
    resolveEntryItems({
      source: 'src/index.ts',
      types: 'lib/types/index.d.ts',
      exports: {
        '.': {
          import: 'lib/esm/index.mjs',
          require: 'lib/cjs/index.cjs',
        },
        waw: {
          import: 'lib/esm/waw.mjs',
          require: 'lib/cjs/waw.cjs',
          types: 'lib/types/waw.d.ts',
          source: 'src/waw.ts',
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    [
      {
        "import": "lib/esm/index.mjs",
        "require": "lib/cjs/index.cjs",
        "source": [
          "src/index.ts",
        ],
        "types": "lib/types/index.d.ts",
      },
      {
        "import": "lib/esm/waw.mjs",
        "require": "lib/cjs/waw.cjs",
        "source": [
          "src/waw.ts",
        ],
        "types": "lib/types/waw.d.ts",
      },
    ]
  `)
})
