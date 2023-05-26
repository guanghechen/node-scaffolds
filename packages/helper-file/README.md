<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/helper-file@5.0.1/packages/helper-file#readme">@guanghechen/helper-file</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/helper-file">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/helper-file.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-file">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/helper-file.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-file">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/helper-file.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/helper-file"
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

A collection of utility functions for handling files, such as split big file or
merge multiple small files.


## Install

* npm

  ```bash
  npm install --save @guanghechen/helper-file
  ```

* yarn

  ```bash
  yarn add @guanghechen/helper-file
  ```

## Usage

* `BigFileHelper` (inspired by [split-file][])

  ```typescript
  import { bigFileHelper, calcFilePartItemsBySize } from '@guanghechen/helper-file'

  async function splitFile(filepath: string): Promise<string[]> {
    const parts = calcFilePartItemsBySize(filepath, 1024 * 1024 * 80) // 80MB per chunk 
    const partFilepaths: string[] = await bigFileHelper.split(filepath, parts)
    return partFilepaths
  }

  splitFile('big-file.txt')
  ```

### Overview

Name                                | Description
:----------------------------------:|:----------------------------:
`BigFileHelper`                     | A utility class for split / merging big files
`bigFileHelper`                     | Default instance of `BigFleHelper`
`calcFilePartItemsBySize`           | Generate file part items by part size
`calcFilePartItemsByCount`          | Generate file part items by total of parts
`calcFilePartNames`                 | Generate file part names (suffix)


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/helper-file@5.0.1/packages/helper-file#readme
[split-file]: https://github.com/tomvlk/node-split-file
