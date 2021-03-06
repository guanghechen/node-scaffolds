[![npm version](https://img.shields.io/npm/v/@guanghechen/postcss-modules-dts.svg)](https://www.npmjs.com/package/@guanghechen/postcss-modules-dts)
[![npm download](https://img.shields.io/npm/dm/@guanghechen/postcss-modules-dts.svg)](https://www.npmjs.com/package/@guanghechen/postcss-modules-dts)
[![npm license](https://img.shields.io/npm/l/@guanghechen/postcss-modules-dts.svg)](https://www.npmjs.com/package/@guanghechen/postcss-modules-dts)
[![Node Version](https://img.shields.io/node/v/@guanghechen/postcss-modules-dts)](https://github.com/nodejs/node)


# `@guanghechen/postcss-modules-dts`

Generate `*.d.ts` files for style files (such as css, stylus and etc), should be worked with [postcss-modules][].

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/postcss-modules-dts
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/postcss-modules-dts
  ```

## Usage

```typescript
import dts from '@guanghechen/postcss-modules-dts'

dts()
dts({ indent: '\t', semicolon: true })
dts({ encoding: 'gbk' })
```

### Options

Name                | Type        | Required | Default
:------------------:|:-----------:|:--------:|:-------:
`encoding`          | `string`    | `false`  | `utf-8`
`indent`            | `string`    | `false`  | `  `
`semicolon`         | `boolean`   | `false`  | `false`
`dtsForCompiledCss` | `boolean`   | `false`  | `false`
`shouldIgnore`      | `Function`  | `false`  | -
`getJSON`           | `Function`  | `false`  | -

* `encoding`: Encoding of the generated `*.d.ts` files.

* `indent`: Code indent in the generated `*.d.ts` files.

* `semicolon`: Whether if print a semicolon at the end of the statement.

* `dtsForCompiledCss`: Whether if generated `*.d.ts` for compiled css files.

* `shouldIgnore`: Determine whether to ignore the given source file or css token.

  ```typescript
  function shouldIgnore(
    cssPath: string,
    json: Record<string, string>,
    outputFilePath: string,
  ): boolean
  ```

* `getJSON`: A callback function that can get the css name mapping. [postcss-modules][] for details.

  ```typescript
  function getJSON(
    cssPath: string,
    json: Record<string, string>,
    outputFilePath: string,
  ): Promise<void> | void
  ```


### Examples

  * Use within [postcss-modules][]

    ```javascript
    import dts from '@guanghechen/postcss-modules-dts'
    import postcssModules from 'postcss-modules'

    postcssModules({
      ...dts()
      // ... other options of postcss-modules
    })
    ```

  * Use within [rollup-plugin-postcss][]

    ```javascript
    import dts from '@guanghechen/postcss-modules-dts'
    import postcss from 'rollup-plugin-postcss'

    postcss({ modules: { ...dts() } })
    ```

## References

* [postcss-modules | Github][postcss-modules]
* [rollup-plugin-postcss | Github][rollup-plugin-postcss]

[postcss-modules]: https://github.com/madyankin/postcss-modules
[rollup-plugin-postcss]: https://github.com/egoist/rollup-plugin-postcss
