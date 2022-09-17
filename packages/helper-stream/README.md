<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/release-2.x.x/packages/helper-stream#readme">@guanghechen/helper-stream</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/helper-stream">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/helper-stream.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-stream">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/helper-stream.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-stream">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/helper-stream.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/helper-stream"
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

Utilities for handing node streams.


## Install

* npm

  ```bash
  npm install --save @guanghechen/helper-stream
  ```

* yarn

  ```bash
  yarn add @guanghechen/helper-stream
  ```

## Usage

Name              | Description
:----------------:|:----------------------------------------------------------:
`concatStreams`   | Concatenate readable streams to async iterator.
`consumeStream`   | Consume readable stream. 
`consumeStreams`  | Consume Consume multiple streams serially.
`destroyBuffer`   | Fill buffer with a random number
`destroyBuffers`  | Fill buffers with random numbers
`mergeStreams`    | Merge multiple readable streams into one readable streams.
`stream2buffer`   | Consume read stream and encode the contents into buffer.


## Example

* Basic.

  ```typescript
  import { consumeStreams } from '@guanghechen/helper-stream'
  import fs from 'fs'

  const filepaths = ['a.txt', 'b.txt', 'c.txt']
  const readers: NodeJS.ReadableStream[] = plainFilepaths.map(fp => fs.createReadStream(fp))
  const writer: NodeJS.WritableStream = fs.createWriteStream('out.txt')
  await consumeStreams(readers, writer)
  ```


* Middlewares, i.e., cipher data before output.

  ```typescript
  import { consumeStreams } from '@guanghechen/helper-stream'
  import crypto from 'crypto'
  import fs from 'fs'

  const filepaths = ['a.txt', 'b.txt', 'c.txt']
  const readers: NodeJS.ReadableStream[] = plainFilepaths.map(fp => fs.createReadStream(fp))
  const writer: NodeJS.WritableStream = fs.createWriteStream('out.txt')

  const iv: Buffer = crypto.randomBytes(32)
  const key: Buffer = crypto.randomBytes(32)
  const cipher: crypto.Cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  await consumeStreams(readers, writer, cipher)
  ```


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/release-2.x.x/packages/helper-stream#readme
