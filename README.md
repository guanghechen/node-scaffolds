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
        alt="Github Top Language"
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


A monorepo contains some utility functions and configs for building `Node.js` / `Typescript` projects.

## Overview

Package                               | Description
:------------------------------------:|:--------------------------
[@guanghechen/eslint-config][]        | Preset eslint configs for node.js/javascript/react/typescript project
[@guanghechen/helper-commander][]     | Utility functions for creating command line programs.
[@guanghechen/helper-file]            | Utilities for handling files, such as split big file or merge multiple small files.
[@guanghechen/helper-func]            | Helpful utility funcs.
[@guanghechen/helper-jest][]          | A collection of utility functions for jest tests.
[@guanghechen/helper-npm][]           | Utilities for handling npm repo and `package.json`.
[@guanghechen/jest-config][]          | Basic jest configs for typescript monorepo
[@guanghechen/mini-copy][]            | Access system clipboard (also support to share clipboard in wsl with windows).
[@guanghechen/postcss-modules-dts][]  | Generate `*.d.ts` files for style files (such as css, stylus and etc)
[@guanghechen/rollup-config][]        | Rollup config for bundle typescript project.
[@guanghechen/rollup-config-cli][]    | Rollup configs for bundle typescript cli project.
[@guanghechen/rollup-plugin-copy][]   | Rollup plugins to copy files and folds (glob supported)
[@guanghechen/tool-file][]            | A cli tool to split / merge big file.
[@guanghechen/tool-mini-copy][]       | "A cli tool to copy / paste with system clipboard or customized fake clipboard (file).


## License

node-scaffolds is [MIT licensed](https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x/LICENSE).


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/release-6.x.x
[@guanghechen/eslint-config]: ./packages/eslint-config
[@guanghechen/helper-commander]: ./packages/helper-commander
[@guanghechen/helper-file]: ./packages/helper-file
[@guanghechen/helper-func]: ./packages/helper-func
[@guanghechen/helper-jest]: ./packages/helper-jest
[@guanghechen/helper-npm]: ./packages/helper-npm
[@guanghechen/jest-config]: ./packages/jest-config
[@guanghechen/mini-copy]: ./packages/mini-copy
[@guanghechen/postcss-modules-dts]: ./packages/postcss-modules-dts
[@guanghechen/rollup-config]: ./packages/rollup-config
[@guanghechen/rollup-config-cli]: ./packages/rollup-config-cli
[@guanghechen/rollup-plugin-copy]: ./packages/rollup-plugin-copy
[@guanghechen/tool-file]: ./packages/tool-file
[@guanghechen/tool-git-cipher]: ./packages/tool-git-cipher
[@guanghechen/tool-mini-copy]: ./packages/tool-mini-copy
