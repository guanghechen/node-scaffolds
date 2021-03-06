[![npm version](https://img.shields.io/npm/v/@guanghechen/eslint-config-ts.svg)](https://www.npmjs.com/package/@guanghechen/eslint-config-ts)
[![npm download](https://img.shields.io/npm/dm/@guanghechen/eslint-config-ts.svg)](https://www.npmjs.com/package/@guanghechen/eslint-config-ts)
[![npm license](https://img.shields.io/npm/l/@guanghechen/eslint-config-ts.svg)](https://www.npmjs.com/package/@guanghechen/eslint-config-ts)
[![Node Version](https://img.shields.io/node/v/@guanghechen/eslint-config-ts)](https://github.com/nodejs/node)
[![eslint version](https://img.shields.io/npm/dependency-version/@guanghechen/eslint-config-ts/peer/eslint)](https://github.com/eslint/eslint)


# `@guanghechen/eslint-config-ts`

Eslint config for ts project.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/eslint-config-ts
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/eslint-config-ts
  ```

## Usage

* Use in .eslintrc.js

  ```javascript
  {
    extends: ['@guanghechen/ts'],
  }
  ```

## Example

See [.eslintrc](https://github.com/guanghechen/node-scaffolds/blob/master/.eslintrc)


```json {28}
{
  "root": true,
  "extends": [
    "@guanghechen",
    "@guanghechen/jsx",
    "plugin:jest/recommended",
    "prettier"
  ],
  "plugins": ["import", "jest", "prettier"],
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "jest": true,
    "node": true
  },
  "rules": {
    "import/no-internal-modules": [
      2,
      {
        "allow": ["util"]
      }
    ]
  },
  "overrides": [
    {
      "files": ["**/*.ts", "**/*tsx"],
      "extends": [
        "@guanghechen/jsx",
        "@guanghechen/ts",
        "plugin:jest/recommended"
      ]
    }
  ]
}
```
