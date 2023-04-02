<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/release-5.x.x/packages/helper-fs#readme">@guanghechen/helper-fs</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/helper-fs">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/helper-fs.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-fs">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/helper-fs.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-fs">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/helper-fs.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/helper-fs"
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

Provide some enhanced methods base on `node:fs`.

## Install

* npm

  ```bash
  npm install --save @guanghechen/helper-fs
  ```

* yarn

  ```bash
  yarn add @guanghechen/helper-fs
  ```

## Usage

Name                                | Description
:----------------------------------:|:----------------------------------------------------------------
`collectAllFiles`                   | (async) Collect all files under the given directory
`collectAllFilesSync`               | Collect all files under the given directory (synchronizing)
`emptyDir`                          | (async) Remove all files under the given directory path.
`ensureCriticalFilepathExistsSync`  | Ensure critical filepath exists
`isDirectorySync`                   | Check whether if the dirpath is a directory path
`isFileSync`                        | Check whether if the filepath is a file path
`isNonExistentOrEmpty`              | Check whether if the dirPath is a non-existent path or empty folder
`mkdirsIfNotExists`                 | Create a path of directories
`writeFile`                         | Same as the writeFile method provided in `node:fs/promises`, except that it will ensure that the parent path exists.


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/release-5.x.x/packages/helper-fs#readme
