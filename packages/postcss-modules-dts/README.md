<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/postcss-modules-dts@6.0.0-alpha.7/packages/postcss-modules-dts#readme">@guanghechen/postcss-modules-dts</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/postcss-modules-dts">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/postcss-modules-dts.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/postcss-modules-dts">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/postcss-modules-dts.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/postcss-modules-dts">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/postcss-modules-dts.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/postcss-modules-dts"
      />
    </a>
    <a href="https://github.com/prettier/prettier">
      <img
        alt="Code Style: prettier"
        src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      />
    </a>
  </div>
</header>
<br/>


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

## Related

* [postcss-modules | Github][postcss-modules]
* [rollup-plugin-postcss | Github][rollup-plugin-postcss]


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/postcss-modules-dts@6.0.0-alpha.7/packages/postcss-modules-dts#readme
[postcss-modules]: https://github.com/madyankin/postcss-modules
[rollup-plugin-postcss]: https://github.com/egoist/rollup-plugin-postcss
