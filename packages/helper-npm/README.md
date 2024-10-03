<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/helper-npm@6.0.0-alpha.5/packages/helper-npm#readme">@guanghechen/helper-npm</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/helper-npm">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/helper-npm.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-npm">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/helper-npm.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-npm">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/helper-npm.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/helper-npm"
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

Utilities for handling npm repo and `package.json`.


## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/helper-npm
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/helper-npm
  ```

## Usage

* `detectMonorepo`: Check whether if it is a monorepo under the `currentDir`.

  ```typescript
  function detectMonorepo(currentDir: string): boolean
  ```

* `detectPackageAuthor`: Detect package author.

  ```typescript
  function detectPackageAuthor(currentDir: string): string | null
  ```

* `getDefaultDependencyFields`: Return default dependency field names.

  ```typescript
  function getDefaultDependencyFields(): ReadonlyArray<
    |'dependencies'
    |'optionalDependencies'
    |'peerDependencies'
  >
  ```

* `collectAllDependencies`: Collect all dependencies declared in the
  `package.json` and the dependencies of them and so on.

  ```typescript
  function collectAllDependencies(
    packageJsonPath: string | null,
    dependenciesFields?: ReadonlyArray<string>,
    additionalDependencies?: ReadonlyArray<string> | null,
    isAbsentAllowed?: ((moduleName: string) => boolean) | null,
  ): string[]
  ```

  - `packageJsonPath`: Filepath of `package.json`
  - `dependenciesFields`: Package dependency field names. (such as
    `['dependencies', 'devDependencies']`)
  - `additionalDependencies`: Additional dependency names appended to the results.
  - `isAbsentAllowed`: Determine whether if a given moduleName can miss. (called
    on `MODULE_NOT_FOUND` error thrown)

* `locateLatestPackageJson`: Find the latest package.json under the give {currentDir} or its
  ancestor path.

  ```typescript
  function locateLatestPackageJson(currentDir: string): string | null 
  ```


## Related


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/helper-npm@6.0.0-alpha.5/packages/helper-npm#readme
