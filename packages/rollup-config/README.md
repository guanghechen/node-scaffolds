<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/rollup-config@6.0.6/packages/rollup-config#readme">@guanghechen/rollup-config</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/rollup-config">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/rollup-config.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/rollup-config">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/rollup-config.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/rollup-config">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/rollup-config.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/rollup-config"
      />
    </a>
    <a href="https://github.com/rollup/rollup">
      <img
        alt="Rollup Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/rollup-config/peer/rollup"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Tested with Jest"
        src="https://img.shields.io/badge/tested_with-jest-9c465e.svg"
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

* Use in `rollup.config.mjs`

  ```javascript
  import createRollupConfig from '@guanghechen/rollup-config'
  import manifest from './package.json' assert { type: "json" }

  export default createRollupConfig({
    manifest,
    pluginOptions: {
      typescriptOptions: {
        tsconfig: 'tsconfig.lib.json',
      },
    }
  })
  ```

* In monorepo such as lerna or yarn, put the following code at the
  `<Monorepo Root>/rollup.config.mjs`:

  ```javascript
  import createRollupConfig from '@guanghechen/rollup-config'
  import path from 'node:path'

  export default async function rollupConfig() {
    const { default: manifest } = await import(
      path.resolve('package.json'),
      { assert: { type: "json" } },
    )
    const config = await createRollupConfig({
      manifest,
      pluginOptions: {
        typescriptOptions: { tsconfig: 'tsconfig.lib.json' },
      },
    })
    return config
  }
  ```

  Then in every package.json of sub-packages, set the scripts field like:

  ```json
  "scripts" {
    "build": "cross-env NODE_ENV=production rollup -c ../../rollup.config.mjs",
    "prebuild": "rimraf lib/",
    "prepublishOnly": "cross-env ROLLUP_SHOULD_SOURCEMAP=false yarn build",
  }
  ```

  The package.json will loaded as `manifest` [option](#option).

### Option

Extended from rollup.InputOptions.

* `additionalPlugins`: Additional rollup plugins (appended after the preset plugins).

  - Type: `string[]`
  - Required: `false`
  - Default: `[]`

* `sourcemap`: Whether if generate sourcemaps.

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
   `types`                | `string`                            | `false`   | Target entry file for ts types
   `dependencies`         | `Record<string, string> | string[]` | `false`   | Dependency list
   `peerDependencies`     | `Record<string, string> | string[]` | `false`   | Peer dependency list
   `optionalDependencies` | `Record<string, string> | string[]` | `false`   | Optional dependency list


* `pluginOptions`

   property             | type      | required  | description
  :--------------------:|:---------:|:---------:|:------------------------
   `commonjsOptions`    | `object`  | `false`   | Options for [@rollup/plugin-commonjs][]
   `jsonOptions`        | `object`  | `false`   | Options for [@rollup/plugin-json][]
   `nodeResolveOptions` | `object`  | `false`   | Options for [@rollup/plugin-node-resolve][]
   `typescriptOptions`  | `object`  | `false`   | Options for [@rollup/plugin-typescript][]
   `dtsOptions`         | `object`  | `false`   | Options for [rollup-plugin-dts][]


[@rollup/plugin-commonjs]: https://github.com/rollup/plugins/tree/master/packages/commonjs#readme
[@rollup/plugin-json]: https://github.com/rollup/plugins/tree/master/packages/json#readme
[@rollup/plugin-node-resolve]: https://github.com/rollup/plugins/tree/master/packages/node-resolve#readme
[@rollup/plugin-typescript]: https://github.com/rollup/plugins/tree/master/packages/typescript#readme
[rollup-plugin-dts]: https://github.com/Swatinem/rollup-plugin-dts


### Environment Variables

  * `ROLLUP_SHOULD_SOURCEMAP`: Determine the default value of `Options.sourcemap`.

    - Default: `true`

  * `ROLLUP_EXTERNAL_ALL_DEPENDENCIES`: Determine the default value of `Options.shouldExternalAll`.

    - Default: `true`


## Related

* [@guanghechen/rollup-plugin-copy][]


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/rollup-config@6.0.6/packages/rollup-config#readme
[@guanghechen/rollup-config]: https://www.npmjs.com/package/@guanghechen/rollup-config
[@guanghechen/rollup-plugin-copy]: https://www.npmjs.com/package/@guanghechen/rollup-plugin-copy
