<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/main/packages/locate-helper#readme">@guanghechen/locate-helper</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/locate-helper">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/locate-helper.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/locate-helper">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/locate-helper.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/locate-helper">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/locate-helper.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/locate-helper"
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
<br/>


Utils for locate nearest filepath matched the given pattern.

## Install

* npm

  ```bash
  npm install --save @guanghechen/locate-helper
  ```

* yarn

  ```bash
  yarn add @guanghechen/locate-helper
  ```

## Usage

### `locateNearestFilepath`

```typescript
export function locateNearestFilepath(
  currentDir: string,
  filenames: string[],
): string | null
```

Locate a nearest filepath from the given `currentDir` which name included
in the give `filenames`.

  * `currentDir`: The starting directory of the locating.

  * `filenames`: The file name list of the file to be searched, the first existed filepath in the list will be returned as the result.

### `findNearestFilepath`

```typescript
export function findNearestFilepath(
  currentDir: string,
  testFilepath: (filepath: string) => boolean,
): string | null
```

Find a nearest filepath from the give `currentDir`which matched the give
tester `testFilepath`.

  * `currentDir`: The starting directory of the searching.

  * `testFilepath`: Test if a given filepath is an expected one.

### `locateLatestPackageJson`

```typescript
export function locateLatestPackageJson(currentDir: string): string | null
```

Find the latest `package.json` under the give `currentDir` or its ancestor path.

  * `currentDir`: The starting directory of the locating.

[homepage]: https://github.com/guanghechen/node-scaffolds/tree/main/packages/locate-helper#readme
