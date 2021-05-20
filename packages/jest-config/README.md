<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/main/packages/jest-config#readme">@guanghechen/jest-config</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/jest-config">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/jest-config.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/jest-config">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/jest-config.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/jest-config">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/jest-config.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/jest-config"
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


Basic jest configs for typescript monorepo.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/jest-config
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/jest-config
  ```

## Usage

* Use in jest.config.js

  ```javascript
  const { tsMonorepoConfig } = require('@guanghechen/jest-config')
  module.exports = {
    ...tsMonorepoConfig(__dirname),
    coverageThreshold: {
      global: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  }
  ```

  - `repositoryRootDir`: Monorepo repository root directory.

## Related


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/main/packages/jest-config#readme
