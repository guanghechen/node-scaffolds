[![npm version](https://img.shields.io/npm/v/@guanghechen/rollup-config-tsx.svg)](https://www.npmjs.com/package/@guanghechen/rollup-config-tsx)
[![npm download](https://img.shields.io/npm/dm/@guanghechen/rollup-config-tsx.svg)](https://www.npmjs.com/package/@guanghechen/rollup-config-tsx)
[![npm license](https://img.shields.io/npm/l/@guanghechen/rollup-config-tsx.svg)](https://www.npmjs.com/package/@guanghechen/rollup-config-tsx)
[![Node Version](https://img.shields.io/node/v/@guanghechen/rollup-config-tsx)](https://github.com/nodejs/node)
[![rollup version](https://img.shields.io/npm/dependency-version/@guanghechen/rollup-config-tsx/peer/rollup)](https://github.com/rollup/rollup)


# `@guanghechen/rollup-config-tsx`

Rollup configs for bundle typescript + react projects.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/rollup-config-tsx
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/rollup-config-tsx
  ```

## Usage

* Use in `rollup.config.js`

  ```javascript
  import createRollupConfigs from '@guanghechen/rollup-config-tsx'
  import manifest from './package.json'

  const configs = createRollupConfigs({
    manifest,
    pluginOptions: {
      typescriptOptions: { tsconfig: 'tsconfig.src.json' },
      postcssOptions: {
        extract: false,
        minimize: true,
        modules: {
          localsConvention: 'camelCase',
          generateScopedName: 'ghc-[local]',
        },
        pluginOptions: {
          postcssUrlOptions: {
            url: 'inline',
            basePath: 'src/assets',
          },
        },
      },
    },
    preprocessOptions: {
      input: ['src/style/index.styl'],
      pluginOptions: {
        multiEntryOptions: {
          exports: false,
        },
        postcssOptions: {
          modules: {
            localsConvention: 'camelCase',
          },
        },
      },
    }
  })

  export default configs
  ```


### Options

Extended from `RollupConfigOptions` of [@guanghechen/rollup-config][].


* `pluginOptions.postcssOptions`: options for [rollup-plugin-postcss][]

  ```typescript
  /**
   * options for rollup-plugin-postcss
   * @see https://github.com/egoist/rollup-plugin-postcss
   */
  PostcssOptions & {
    pluginOptions?: {
      /**
       * options for autoprefixer
       */
      autoprefixerOptions?: PostcssPluginAutoprefixerOptions
      /**
       * options for postcss-url
       */
      postcssUrlOptions?: PostcssPluginPostcssUrlOptions
    }
  }
  ```

* `preprocessOptions`: Options on preprocess phase (such as generate *.d.ts for css files).

  ```typescript
  /**
   * Rollup input config
   */
  input: string | string[] | { include?: string[]; exclude?: string }
  /**
   * Rollup output config (required in `rollup -w` mode)
   */
  output?: rollup.OutputOptions | rollup.OutputOptions[]
  /**
   * Rollup plugin options
   */
  pluginOptions?: {
    /**
     * options for @rollup/plugin-multi-entry
     */
    multiEntryOptions?: MultiEntryOptions
    /**
     * options for rollup-plugin-postcss
     */
    postcssOptions?: PostcssOptions
  }
  ```


[@guanghechen/rollup-config]: https://github.com/guanghechen/node-scaffolds/packages/rollup-config#options
[rollup-plugin-postcss]: https://github.com/egoist/rollup-plugin-postcss
