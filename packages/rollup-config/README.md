[![npm version](https://img.shields.io/npm/v/@guanghechen/rollup-config.svg)](https://www.npmjs.com/package/@guanghechen/rollup-config)
[![npm download](https://img.shields.io/npm/dm/@guanghechen/rollup-config.svg)](https://www.npmjs.com/package/@guanghechen/rollup-config)
[![npm license](https://img.shields.io/npm/l/@guanghechen/rollup-config.svg)](https://www.npmjs.com/package/@guanghechen/rollup-config)
[![Node Version](https://img.shields.io/node/v/@guanghechen/rollup-config)](https://github.com/nodejs/node)
[![rollup version](https://img.shields.io/npm/dependency-version/@guanghechen/rollup-config/peer/rollup)](https://github.com/rollup/rollup)

# `@guanghechen/rollup-config`

Rollup configs for bundle typescript project.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/rollup-config
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/rollup-config
  ```

## Usage

* Use in `rollup.config.js`

  ```javascript
  import createRollupConfig from '@guanghechen/rollup-config'
  import manifest from './package.json'

  const config = createRollupConfig({
    manifest,
    pluginOptions: {
      typescriptOptions: {
        tsconfig: 'tsconfig.src.json',
      },
    }
  })

  export default config
  ```

### Options

Extended from rollup.InputOptions.

* `additionalPlugins`: Additional rollup plugins (appended after the preset plugins).

  - Type: `string[]`
  - Required: `false`
  - Default: `[]`

* `shouldSourceMap`: Whether if generate sourcemaps.

  - Type: `boolean`
  - Required: `false`
  - Default: Depends on [Environment Params](#environment)

* `shouldExternalAll`: Whether if make all dependencies external.

  - Type: `boolean`
  - Required: `false`
  - Default: Depends on [Environment Params](#environment)

* `manifest`

   property               | type                                | required  | description
  :----------------------:|:-----------------------------------:|:---------:|:------------------------
   `source`               | `string`                            | `true`    | Source entry file
   `main`                 | `string`                            | `false`   | Target entry file for cjs bundles
   `module`               | `string`                            | `false`   | Target entry file for es bundles
   `dependencies`         | `Record<string, string> | string[]` | `false`   | Dependency list
   `peerDependencies`     | `Record<string, string> | string[]` | `false`   | Peer dependency list
   `optionalDependencies` | `Record<string, string> | string[]` | `false`   | Optional dependency list


* `pluginOptions`

   property             | type      | required  | description
  :--------------------:|:---------:|:---------:|:------------------------
   `commonjsOptions`    | `object`  | `false`   | Options for [@rollup/plugin-commonjs][]
   `jsonOptions`        | `object`  | `false`   | Options for [@rollup/plugin-json][]
   `nodeResolveOptions` | `object`  | `false`   | Options for [@rollup/plugin-node-resolve][]
   `typescriptOptions`  | `object`  | `false`   | Options for [rollup-plugin-typescript2][]


[@rollup/plugin-commonjs]: https://github.com/rollup/plugins/tree/master/packages/commonjs#readme
[@rollup/plugin-json]: https://github.com/rollup/plugins/tree/master/packages/json#readme
[@rollup/plugin-node-resolve]: https://github.com/rollup/plugins/tree/master/packages/node-resolve#readme
[rollup-plugin-typescript2]: https://github.com/ezolenko/rollup-plugin-typescript2#readme


### Environment

  * `ROLLUP_SHOULD_SOURCEMAP`: Determine the default value of `Options.shouldSourceMap`.

    - Default: `true`

  * `ROLLUP_EXTERNAL_ALL_DEPENDENCIES`: Determine the default value of `Options.shouldExternalAll`.

    - Default: `true`
