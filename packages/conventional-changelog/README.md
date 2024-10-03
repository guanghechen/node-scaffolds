<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/conventional-changelog@6.0.0/packages/conventional-changelog#readme">@guanghechen/conventional-changelog</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/conventional-changelog">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/conventional-changelog.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/conventional-changelog">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/conventional-changelog.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/conventional-changelog">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/conventional-changelog.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/conventional-changelog"
      />
    </a>
    <a href="https://github.com/eslint/eslint">
      <img
        alt="Eslint Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/conventional-changelog/peer/eslint"
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


Eslint config for jsx.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/conventional-changelog
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/conventional-changelog
  ```

## Usage

* Use in lerna.json

  ```javascript
  {
    "changelog": {
      "preset": "@guanghechen/conventional-changelog"
    },
    "command": {
      "publish": {
        "conventionalCommits": true
      },
      "version": {
        "conventionalCommits": true
      }
    }
  }
  ```


## Example


## Related

* [conventional-changelog][]


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/conventional-changelog@6.0.0/packages/conventional-changelog#readme
[@guanghechen/conventional-changelog]: https://www.npmjs.com/package/@guanghechen/conventional-changelog
[conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog
