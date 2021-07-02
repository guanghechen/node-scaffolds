<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/main/packages/cipher-helper#readme">@guanghechen/cipher-helper</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/cipher-helper">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/cipher-helper.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/cipher-helper">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/cipher-helper.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/cipher-helper">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/cipher-helper.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/cipher-helper"
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
  npm install --save @guanghechen/cipher-helper
  ```

* yarn

  ```bash
  yarn add @guanghechen/cipher-helper
  ```

## Usage

* `AESCipherHelper`

  ```typescript
  import { AESCipherHelper } from '@guanghechen/cipher-helper'

  const cipher = new AESCipherHelper()  // Some options
  cipher.initFromSecret(cipher.createSecret())  // Or use password 

  // encrypt / decrypt
  cipher.encrypt(Buffer.from('plain data'))     // => Buffer
  cipher.decrypt(Buffer.from('cypher data'))    // => Buffer

  // encrypt / decrypt file
  cipher.encryptFile('plain.txt', 'cipher.txt')
  cipher.decryptFile('cipher.txt', 'plain.txt')

  // encrypt / decrypt files
  cipher.encryptFile(['plain1.txt', 'plain2.txt'], 'cipher.txt')
  cipher.decryptFile(['cipher1.txt', 'cipher2.txt'], 'plain.txt')
  ```

### Overview

Name                                | Description
:----------------------------------:|:----------------------------:
`createRandomIv`                    | Create random initial vector
`createRandomKey`                   | Create random key of aes
`calcMac`                           | Calc Message Authentication Code
`destroyBuffer`                     | Fill buffer with a random number
`destroyBuffers`                    | Fill buffers with random numbers
`streams2buffer`                    | Merge multiple read streams into Buffer serially
`AESCipherHelper`                   | A CipherHelper implementation with AES algorithm.



[homepage]: https://github.com/guanghechen/node-scaffolds/tree/main/packages/cipher-helper#readme
