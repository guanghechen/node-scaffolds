<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/release-5.x.x/packages/rollup-config-cli#readme">@guanghechen/rollup-config-cli</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/rollup-config-cli">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/rollup-config-cli.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/rollup-config-cli">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/rollup-config-cli.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/rollup-config-cli">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/rollup-config-cli.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/rollup-config-cli"
      />
    </a>
    <a href="https://github.com/rollup/rollup">
      <img
        alt="Rollup Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/rollup-config-cli/peer/rollup"
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


## Related

* [@guanghechen/rollup-config][]
* [@guanghechen/rollup-plugin-copy][]


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/release-5.x.x/packages/rollup-config-cli#readme
[@guanghechen/rollup-config]: https://www.npmjs.com/package/@guanghechen/rollup-config
[@guanghechen/rollup-config-cli]: https://www.npmjs.com/package/@guanghechen/rollup-config-cli
[@guanghechen/rollup-plugin-copy]: https://www.npmjs.com/package/@guanghechen/rollup-plugin-copy
