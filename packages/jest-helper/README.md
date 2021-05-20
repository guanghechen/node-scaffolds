<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/guanghechen/tree/main/packages/jest-helper#readme">@guanghechen/jest-helper</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/jest-helper">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/jest-helper.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/jest-helper">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/jest-helper.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/jest-helper">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/jest-helper.svg"
      />
    </a>
    <a href="#install">
      <img
        alt="Module Formats: cjs"
        src="https://img.shields.io/badge/module_formats-cjs-green.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/jest-helper"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Eslint Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/jest-helper/peer/jest"
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


A collection of utility functions for jest tests.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/jest-helper
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/jest-helper
  ```

## Usage

### Desensitizers

  * `StringDesensitizer`: `(text: string, key?: string) => string`

    - `composeStringDesensitizers`: Compose multiple desensitizers into one.

      ```typescript
      function composeStringDesensitizers(
        ...desensitizers: ReadonlyArray<StringDesensitizer>
      ): StringDesensitizer
      ```

    - `createFilepathDesensitizer`: Create a StringDesensitizer to eliminate
      sensitive filepath data (Replace matched filepath with the `replaceString`).

      ```typescript
      export function createFilepathDesensitizer(
        baseDir: string,
        replaceString = '<WORKSPACE>',
      ): StringDesensitizer
      ```

    - `createPackageVersionDesensitizer`: Create a StringDesensitizer to
      eliminate volatile package versions.

      ```typescript
      function createPackageVersionDesensitizer(
        nextVersion: (packageVersion: string, packageName: string) => string,
        testPackageName?: (packageName: string) => boolean,
      ): StringDesensitizer
      ```

      * `nextVersion`: Determine the new version of the given
        `{packageName}` package.

        - `@param packageVersion`: packageVersion (without prefix)
        - `@param packageName`: packageName
          `/([\^><~]=?)?/`)
        - `@returns`:

      * `testPackageName`: Test if the version should be change of the
        `{packageName}` package.

        - `@param packageName`:

  * `JsonDesensitizer`: `(json: unknown, key?: string) => unknown`

    - `createJsonDesensitizer`: Create a desensitizer to eliminate sensitive
      json data.

      ```typescript
      createJsonDesensitizer(
        valDesensitizers: {
          string?: StringDesensitizer
          number?: NumberDesensitizer
          fallback?: Desensitizer<unknown>
        },
        keyDesensitizer?: StringDesensitizer,
      ): JsonDesensitizer
      ```

      * `valDesensitizers`: Desensitizers for values of `object` / `array` or
        literal `string` and `number`

        - `string`: Desensitize `number` type value of `object` / `array` or
          literal `string`.
        - `number`: Desensitize `number` type value of `object` / `array` or
          literal `number`.
        - `number`: Desensitize other type value of `object` / `array` or
          other literal primitive values.

      * `keyDesensitizer`: Desensitizer for keys of object

### snapshots

  * `fileSnapshot`: Create snapshot for give filepaths.

    ```typescript
    fileSnapshot(
      baseDir: string,
      filenames: string[],
      desensitize?: StringDesensitizer,
      encoding: BufferEncoding = 'utf-8',
    ): void
    ```

### mocks

  * `createConsoleMock`: Create mock funcs on `console`

    ```typescript
    export function createConsoleMock(
      methodNames?: ReadonlyArray<'debug' | 'log' | 'info' | 'warn' | 'error'> =
        ['debug', 'log', 'info', 'warn', 'error'],
      desensitize?: (args: unknown[]) => unknown[]
    ): ConsoleMock
    ```

    Example:

    ```typescript
    const mock = createConsoleMock()

    console.debug('debug waw1')
    console.log('log waw2')
    expect(mock.get('debug')).toEqual([['debug waw1']])
    expect(mock.get('log')).toEqual([['log waw2']])
    expect(mock.getIndiscriminateAll()).toEqual([['debug waw1'], ['log waw2']])

    mock.reset()
    console.info('info waw3')
    console.error('error waw4')
    expect(mock.get('info')).toEqual([['info waw3']])
    expect(mock.get('error')).toEqual([['error waw4']])
    expect(mock.getIndiscriminateAll()).toEqual([['info waw3'], ['error waw4']])

    mock.restore()
    ```

## Related


[homepage]: https://github.com/guanghechen/guanghechen/tree/main/packages/jest-helper#readme
