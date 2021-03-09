[![npm version](https://img.shields.io/npm/v/@guanghechen/rollup-config-tsx.svg)](https://www.npmjs.com/package/@guanghechen/rollup-config-tsx)
[![npm download](https://img.shields.io/npm/dm/@guanghechen/rollup-config-tsx.svg)](https://www.npmjs.com/package/@guanghechen/rollup-config-tsx)
[![npm license](https://img.shields.io/npm/l/@guanghechen/rollup-config-tsx.svg)](https://www.npmjs.com/package/@guanghechen/rollup-config-tsx)
[![Node Version](https://img.shields.io/node/v/@guanghechen/rollup-config-tsx)](https://github.com/nodejs/node)
[![rollup version](https://img.shields.io/npm/dependency-version/@guanghechen/rollup-config-tsx/peer/rollup)](https://github.com/rollup/rollup)
[![Tested With Jest](https://img.shields.io/badge/tested_with-jest-9c465e.svg)](https://github.com/facebook/jest)
[![Code Style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


# `@guanghechen/rollup-config-tsx`

Rollup configs for bundle typescript + react projects.

## Install

* npm

  ```bash
  //`stylus` is optional.
  npm install --save-dev @guanghechen/rollup-config-tsx stylus
  ```

* yarn

  ```bash
  // `stylus` is optional.
  yarn add --dev @guanghechen/rollup-config-tsx stylus
  ```

## Usage

* Use in `rollup.config.js`

  ```javascript
  import createRollupConfigs from '@guanghechen/rollup-config-tsx'
  import type url from 'postcss-url'
  import manifest from './package.json'

  const configs = createRollupConfigs({
    manifest,
    shouldSourceMap: false,
    preprocessOptions: {
      input: ['src/style/index.styl'],
      pluginOptions: {
        multiEntryOptions: {
          exports: false,
        },
        postcssOptions: {
          modules: {
            localsConvention: 'camelCase',
            generateScopedName: 'ghc-[local]',
          },
          postcssUrlOptions: {
            url: 'inline',
            maxSize: 0.5, // 0.5 KB
            assetsPath: path.join(__dirname, 'lib'),
            fallback: 'copy',
            basePath: [path.join(__dirname, 'src')],
            useHash: false,
          },
        },
      },
    },
    pluginOptions: {
      typescriptOptions: { tsconfig: 'tsconfig.src.json' },
      postcssOptions: {
        extract: 'index.css',
        minimize: false,
        sourceMap: false,
        modules: {
          localsConvention: 'camelCase',
          generateScopedName: 'ghc-[local]',
        },
        postcssUrlOptions: {
          url: 'inline',
          maxSize: 0.5, // 0.5 KB
          basePath: [path.join(__dirname, 'src')],
          fallback: function (asset: Parameters<url.CustomTransformFunction>[0]) {
            const url = asset.url.replace(/^[/]assets[/]/, '../assets/')
            return url
          },
        },
      },
    },
  })

  export default configs
  ```

  At the same time, you should have a project structure similar to the following:

  ```
  ├── src
  │   ├── assets
  │   │   ├── font
  │   │   │   └── tangerine.woff2
  │   │   └── image
  │   │       └── background.jpeg
  │   ├── index.tsx
  │   └── style
  │       └── index.styl
  ├── package.json
  ├── rollup.config.js
  ├── tsconfig.json
  └── tsconfig.src.json
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
    /**
     * options for autoprefixer
     * @see https://github.com/postcss/autoprefixer
     */
    autoprefixerOptions?: PostcssPluginAutoprefixerOptions
    /**
     * options for postcss-flexbugs-fixes
     * @see https://github.com/luisrudge/postcss-flexbugs-fixes#readme
     */
    flexbugsFixesOptions?: PostcssPluginFlexbugsFixesOptions
    /**
     * options for postcss-url
     * @see https://github.com/postcss/postcss-url#readme
     */
    postcssUrlOptions?: PostcssPluginPostcssUrlOptions
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
    postcssOptions?: PostcssOptions & {
      /**
       * options for postcss-url
       */
      postcssUrlOptions?: PostcssPluginPostcssUrlOptions
    }
  }
  ```


[@guanghechen/rollup-config]: https://github.com/guanghechen/node-scaffolds/packages/rollup-config#options
[rollup-plugin-postcss]: https://github.com/egoist/rollup-plugin-postcss
