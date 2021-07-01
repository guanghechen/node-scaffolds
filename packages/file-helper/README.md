<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/main/packages/file-helper#readme">@guanghechen/file-helper</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/file-helper">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/file-helper.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/file-helper">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/file-helper.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/file-helper">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/file-helper.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/file-helper"
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


## Install

* npm

  ```bash
  npm install --save @guanghechen/file-helper
  ```

* yarn

  ```bash
  yarn add @guanghechen/file-helper
  ```

## Usage

* `BigFileHelper` (inspired by [split-file][])

  ```typescript
  import { 
    bigFileHelper, 
    calcFilePartItemsBySize,
  } from '@guanghechen/file-helper'

  async function splitFile(filepath: string): Promise<string[]> {
    const parts = calcFilePartItemsBySize(filepath, 1024 * 1024 * 80) // 80MB per chunk 
    const partFilepaths: string[] = await bigFileHelper.split(filepath, parts)
    return partFilepaths
  }

  splitFile('big-file.txt')
  ```

### Overview

Name                          | Description
:----------------------------:|:----------------------------:
`calcFilePartItemsBySize`     | Generate file part items by part size
`calcFilePartItemsByCount`    | Generate file part items by total of parts
`BigFileHelper`               | A utility class for split / merging big files
`bigFileHelper`               | Default instance of `BigFleHelper`


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/main/packages/file-helper#readme
[split-file]: https://github.com/tomvlk/node-split-file
