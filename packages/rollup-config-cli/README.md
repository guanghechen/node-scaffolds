[![npm version](https://img.shields.io/npm/v/@guanghechen/rollup-config-cli.svg)](https://www.npmjs.com/package/@guanghechen/rollup-config-cli)
[![npm download](https://img.shields.io/npm/dm/@guanghechen/rollup-config-cli.svg)](https://www.npmjs.com/package/@guanghechen/rollup-config-cli)
[![npm license](https://img.shields.io/npm/l/@guanghechen/rollup-config-cli.svg)](https://www.npmjs.com/package/@guanghechen/rollup-config-cli)
[![Node Version](https://img.shields.io/node/v/@guanghechen/rollup-config-cli)](https://github.com/nodejs/node)
[![rollup version](https://img.shields.io/npm/dependency-version/@guanghechen/rollup-config-cli/peer/rollup)](https://github.com/rollup/rollup)

# `@guanghechen/rollup-config-cli`

Rollup configs for bundle typescript cli project.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/rollup-config-cli
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/rollup-config-cli
  ```

## Usage

* Use in `rollup.config.js`

  ```javascript
  import createRollupConfig from '@guanghechen/rollup-config-cli'
  import manifest from './package.json'

  const config = createRollupConfig({
    manifest,
    pluginOptions: {
      typescriptOptions: {
        tsconfig: 'tsconfig.src.json',
      },
    },
    resources: {
      copyOnce: true,
      verbose: true,
      targets: [
        {
          src: 'src/config/*',
          dest: 'lib/config',
        },
      ],
    },
    targets: [{
      src: 'src/cli.ts',
      target: 'lib/cjs/cli.js',
    }],
  })

  export default config
  ```

### Options

Extended from `RollupConfigOptions` of [@guanghechen/rollup-config][].


* `resources`: `RollupPluginCopyOptions` of [@guanghechen/rollup-plugin-copy][].

  Copy resources / configs.

* `targets`: `{src: string, target: string}[]`: Node.js bin targets.


[@guanghechen/rollup-config]: https://github.com/guanghechen/node-scaffolds/packages/rollup-config#options
[@guanghechen/rollup-plugin-copy]: https://github.com/guanghechen/node-scaffolds/packages/rollup-plugin-copy#Configuration
