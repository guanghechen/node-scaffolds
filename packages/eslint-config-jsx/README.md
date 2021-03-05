[![npm version](https://img.shields.io/npm/v/@guanghechen/eslint-config-jsx.svg)](https://www.npmjs.com/package/@guanghechen/eslint-config-jsx)
[![npm download](https://img.shields.io/npm/dm/@guanghechen/eslint-config-jsx.svg)](https://www.npmjs.com/package/@guanghechen/eslint-config-jsx)
[![npm license](https://img.shields.io/npm/l/@guanghechen/eslint-config-jsx.svg)](https://www.npmjs.com/package/@guanghechen/eslint-config-jsx)
[![eslint version](https://img.shields.io/npm/dependency-version/@guanghechen/eslint-config-jsx/peer/eslint)](https://github.com/eslint/eslint)


# `@guanghechen/eslint-config-jsx`


## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/eslint-config-jsx
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/eslint-config-jsx
  ```

## Usage

* Use in .eslintrc.js

  ```javascript
  {
    extends: ['@guanghechen/jsx'],
  }
  ```


## Example

See [.eslintrc](https://github.com/guanghechen/node-scaffolds/blob/master/.eslintrc)

```json {5,29}
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
