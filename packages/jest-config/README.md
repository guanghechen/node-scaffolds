<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/jest-config@6.0.1/packages/jest-config#readme">@guanghechen/jest-config</a>
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

  module.exports = async function () {
    const baseConfig = await tsMonorepoConfig(__dirname, { useESM: true })
    return {
      ...baseConfig,
      coverageThreshold: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
    }
  }
  ```

* Use in jest.config.mjs

  ```javascript
  import { tsMonorepoConfig } from '@guanghechen/jest-config'
  import path from 'node:path'
  import url from 'node:url'

  export default async function () {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
    const baseConfig = await tsMonorepoConfig(__dirname, { useESM: true })

    return {
      ...baseConfig,
      coverageThreshold: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
    }
  }
  ```

## Related


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/jest-config@6.0.1/packages/jest-config#readme
