<header>
  <div align="center">
    <a href="#license">
      <img
        alt="License"
        src="https://img.shields.io/github/license/guanghechen/node-scaffolds"
      />
    </a>
    <a href="https://github.com/guanghechen/node-scaffolds/tags">
      <img
        alt="Package Version"
        src="https://img.shields.io/github/v/tag/guanghechen/node-scaffolds?include_prereleases&sort=semver"
      />
    </a>
    <a href="https://github.com/guanghechen/node-scaffolds/search?l=typescript">
      <img
        alt="Github Top Language"
        src="https://img.shields.io/github/languages/top/guanghechen/node-scaffolds"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/rollup-config-tsx"
      />
    </a>
    <a href="https://github.com/guanghechen/node-scaffolds/actions/workflows/ci.yml">
      <img
        alt="CI Workflow"
        src="https://github.com/guanghechen/node-scaffolds/workflows/Build/badge.svg?branch=master"
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


A monorepo contains some utility functions and configs for building `Node.js` / `Typescript` projects.

## Overview

Package                               | Description
:------------------------------------:|:--------------------------
[@guanghechen/eslint-config][]        | Eslint config for `Node.js` / `Javascript` project
[@guanghechen/eslint-config-jsx][]    | Eslint config for `Jsx` project
[@guanghechen/eslint-config-ts][]     | Eslint config for `Typescript` project
[@guanghechen/jest-config][]          | Basic jest configs for typescript monorepo
[@guanghechen/jest-helper][]          | A collection of utility functions for jest tests
[@guanghechen/locate-helper][]        | A collection of utility functions for locating nearest filepath matched the given pattern
[@guanghechen/option-helper][]        | A collection of utility functions for processing options
[@guanghechen/plop-helper][]          | A collection of utility functions for plop templates
[@guanghechen/postcss-modules-dts][]  | Generate `*.d.ts` files for style files (such as css, stylus and etc)
[@guanghechen/rollup-config][]        | Rollup config for bundle typescript project
[@guanghechen/rollup-config-cli][]    | Rollup configs for bundle typescript cli project
[@guanghechen/rollup-plugin-copy][]   | Rollup plugins to copy files and folds (glob supported)
[@guanghechen/template-ts-package][]  | Plop templates for creating simple typescript project
[@guanghechen/template-tsx-package][] | Plop templates for creating simple typescript + react project


## License

node-scaffolds is [MIT licensed](https://github.com/guanghechen/node-scaffolds/blob/master/LICENSE).


[homepage]: https://github.com/guanghechen/node-scaffolds
[@guanghechen/eslint-config]: ./packages/eslint-config
[@guanghechen/eslint-config-jsx]: ./packages/eslint-config-jsx
[@guanghechen/eslint-config-ts]: ./packages/eslint-config-ts
[@guanghechen/jest-config]: ./packages/jest-config
[@guanghechen/jest-helper]: ./packages/jest-helper
[@guanghechen/locate-helper]: ./packages/locate-helper
[@guanghechen/option-helper]: ./packages/option-helper
[@guanghechen/plop-helper]: ./packages/plop-helper
[@guanghechen/postcss-modules-dts]: ./packages/postcss-modules-dts
[@guanghechen/rollup-config]: ./packages/rollup-config
[@guanghechen/rollup-config-cli]: ./packages/rollup-config-cli
[@guanghechen/rollup-plugin-copy]: ./packages/rollup-plugin-copy
[@guanghechen/template-ts-package]: ./packages/template-ts-package
[@guanghechen/template-tsx-package]: ./packages/template-tsx-package
