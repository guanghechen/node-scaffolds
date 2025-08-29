<header>
  <div align="center">
    <a href="#license">
      <img
        alt="License"
        src="https://img.shields.io/github/license/guanghechen/node-scaffolds"
      />
    </a>
    <a href="https://github.com/guanghechen/node-scaffolds/search?l=typescript">
      <img
        alt="GitHub Top Language"
        src="https://img.shields.io/github/languages/top/guanghechen/node-scaffolds"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/rollup-config"
      />
    </a>
    <a href="https://github.com/guanghechen/node-scaffolds/actions/workflows/ci.yml">
      <img
        alt="CI Workflow"
        src="https://github.com/guanghechen/node-scaffolds/actions/workflows/ci.yml/badge.svg"
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


A monorepo contains some utility functions and configs for building `Node.js` / `TypeScript` projects.

## Overview

Package                               | Description
:------------------------------------:|:--------------------------
[@guanghechen/commander][]            | A wrapper of commander.js with some utilities.
[@guanghechen/eslint-config][]        | Preset ESLint configurations for node.js/javascript/react/typescript projects.
[@guanghechen/fs]                     | Utilities for handling files, such as splitting big files or merging multiple small files.
[@guanghechen/helper-jest][]          | A collection of utility functions for jest tests.
[@guanghechen/helper-npm][]           | Utilities for handling npm repo and `package.json`.
[@guanghechen/jest-config][]          | Basic Jest configurations for TypeScript monorepo
[@guanghechen/mini-copy][]            | Access system clipboard (also support to share clipboard in wsl with windows).
[@guanghechen/postcss-modules-dts][]  | Generate `*.d.ts` files for style files (such as css, stylus and etc)
[@guanghechen/rollup-config][]        | Rollup configuration for bundling TypeScript projects.
[@guanghechen/rollup-plugin-copy][]   | Rollup plugins to copy files and folds (glob supported)
[@guanghechen/tool-file][]            | A CLI tool to split / merge big files.
[@guanghechen/tool-mini-copy][]       | A CLI tool to copy / paste with system clipboard or custom fake clipboard (file).


## License

node-scaffolds is [MIT licensed](https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x/LICENSE).


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x
[@guanghechen/eslint-config]: ./packages/eslint-config
[@guanghechen/commander]: ./packages/commander
[@guanghechen/fs]: ./packages/fs
[@guanghechen/helper-jest]: ./packages/helper-jest
[@guanghechen/helper-npm]: ./packages/helper-npm
[@guanghechen/jest-config]: ./packages/jest-config
[@guanghechen/mini-copy]: ./packages/mini-copy
[@guanghechen/postcss-modules-dts]: ./packages/postcss-modules-dts
[@guanghechen/rollup-config]: ./packages/rollup-config
[@guanghechen/rollup-plugin-copy]: ./packages/rollup-plugin-copy
[@guanghechen/tool-file]: ./packages/tool-file
[@guanghechen/tool-git-cipher]: ./packages/tool-git-cipher
[@guanghechen/tool-mini-copy]: ./packages/tool-mini-copy
