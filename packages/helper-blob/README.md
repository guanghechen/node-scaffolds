<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/main/packages/helper-blob#readme">@guanghechen/helper-blob</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/helper-blob">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/helper-blob.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-blob">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/helper-blob.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-blob">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/helper-blob.svg"
      />
    </a>
    <a href="#install">
      <img
        alt="Module Formats: cjs, esm"
        src="https://img.shields.io/badge/module_formats-cjs%2C%20esm-green.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/helper-blob"
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


`helper-blob` is a colorful logger tool based on [chalk][] (so you can use a
lot of colors), and can be easily integrated into [commander.js][] (so you can
use command line parameters to customized the logger's behavior).


## Install

* npm

  ```bash
  npm install --save @guanghechen/helper-blob
  ```

* yarn

  ```bash
  yarn add @guanghechen/helper-blob
  ```

## Usage

* `convertDataURLToBlob(dataURL: string): Blob`: Creates and returns a blob from
  a data URL (either base64 encoded or not).


* `downloadBlob(blob: Blob, filename: string): void`: emit a download task in
  browser.


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/main/packages/helper-blob#readme
