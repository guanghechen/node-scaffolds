[![npm version](https://img.shields.io/npm/v/@guanghechen/locate-helper.svg)](https://www.npmjs.com/package/@guanghechen/locate-helper)
[![npm download](https://img.shields.io/npm/dm/@guanghechen/locate-helper.svg)](https://www.npmjs.com/package/@guanghechen/locate-helper)
[![npm license](https://img.shields.io/npm/l/@guanghechen/locate-helper.svg)](https://www.npmjs.com/package/@guanghechen/locate-helper)


# `@guanghechen/locate-helper`


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
