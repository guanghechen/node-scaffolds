<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/eslint-config@5.0.0/packages/eslint-config-ts#readme">@guanghechen/eslint-config-ts</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/eslint-config-ts">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/eslint-config-ts.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/eslint-config-ts">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/eslint-config-ts.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/eslint-config-ts">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/eslint-config-ts.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/eslint-config-ts"
      />
    </a>
    <a href="https://github.com/eslint/eslint">
      <img
        alt="Eslint Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/eslint-config-ts/peer/eslint"
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

See [.eslintrc](https://github.com/guanghechen/node-scaffolds/tree/release-5.x.x/.eslintrc)


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

## Related

* [@guanghechen/eslint-config][]
* [@guanghechen/eslint-config-jsx][]


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/eslint-config@5.0.0/packages/eslint-config-ts#readme
[@guanghechen/eslint-config]: https://www.npmjs.com/package/@guanghechen/eslint-config
[@guanghechen/eslint-config-jsx]: https://www.npmjs.com/package/@guanghechen/eslint-config-jsx
[@guanghechen/eslint-config-ts]: https://www.npmjs.com/package/@guanghechen/eslint-config-ts
