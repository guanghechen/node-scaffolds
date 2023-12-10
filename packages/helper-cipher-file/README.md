<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/helper-cipher-file@6.0.0-alpha.12/packages/helper-cipher-file#readme">@guanghechen/helper-cipher-file</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/helper-cipher-file">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/helper-cipher-file.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-cipher-file">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/helper-cipher-file.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-cipher-file">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/helper-cipher-file.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/helper-cipher-file"
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

Utility functions for encrypt / decrypt files.


## Install

* npm

  ```bash
  npm install --save @guanghechen/helper-cipher-file
  ```

* yarn

  ```bash
  yarn add @guanghechen/helper-cipher-file
  ```

## Usage

* `FileCipherPathResolver`

  ```typescript
  import path from 'node:path'
  import url from 'node:url'
  import { FileCipherPathResolver } from '@guanghechen/helper-cipher-file'

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
  const sourceRootDir = path.join(__dirname, 'src')
  const encryptedRootDir = path.join(__dirname, 'lib')
  const pathResolver = new FileCipherPathResolver({ sourceRootDir, encryptedRootDir })

  // calcAbsoluteSourceFilepath
  pathResolver.calcAbsoluteSourceFilepath('waw.txt') // => path.join(sourceRootDir, 'waw.txt')

  // calcAbsoluteEncryptedFilepath
  pathResolver.calcAbsoluteEncryptedFilepath('waw.txt') // => path.join(encryptedRootDir, 'waw.txt')

  // calcRelativeSourceFilepath
  pathResolver.calcRelativeSourceFilepath(path.join(sourceRootDir, 'waw.txt')) // => 'waw.txt'

  // calcRelativeEncryptedFilepath
  pathResolver.calcRelativeEncryptedFilepath(path.join(encryptedRootDir, 'waw.txt')) // => 'waw.txt'
  ```

* `FileCipherPathResolver`

  ```typescript

  ```

* `FileCipher`

  ```typescript
  import { ChalkLogger } from '@guanghechen/chalk-logger'
  import { AesCipherFactory } from '@guanghechen/helper-cipher'
  import { FileCipherFactory } from '@guanghechen/helper-cipher-file'

  const logger = new ChalkLogger({ flights: { colorful: false, date: false } })
  const cipherFactory = new AesCipherFactory()
  const fileCipherFactory = new FileCipherFactory({ cipherFactory, logger })
  const fileCipher = fileCipherFactory.fileCipher()

  // Encrypt multiple files and concatenate the encrypted contents.
  const encryptedContent: Buffer = await fileCipher.encryptFromFiles([sourceFilepath, sourceFilepath2, ...])

  // Encrypt multiple files and concatenate the decrypted contents.
  const decryptedContent: Buffer = await fileCipher.decryptFromFiles([encryptedFilepath1, encryptedFilepath2, ...])

  // Encrypt multiple files and write the concatenated encrypted contents into another file.
  await fileCipher.encryptFile([sourceFilepath1, sourceFilepath2, ...], outputFilepath)

  // Decrypt multiple files and write the concatenated decrypted contents into another file.
  await fileCipher.decryptFiles([encryptedFilepath1, encryptedFilepath2, ...], outputFilepath)

  // Decrypt file and write the encrypted content into another file.
  await fileCipher.encryptFiles([sourceFilepath1, sourceFilepath2, ...], outputFilepath)

  // Decrypt file and write the encrypted content into another file.
  await fileCipher.decryptFiles([encryptedFilepath1, encryptedFilepath2, ...], outputFilepath)
  ```


### Overview

Name                      | Description
:------------------------:|:----------------------------:
FileCipher                | Encrypt / Decrypt files.
FileCipherCatalog         | Encrypt / Decrypt files with catalog./home/lemon/ws/guanghechen/sora/packages/mac/src
FileCipherPathResolver    | Resolve the relative / absolute filepaths.
calcFileCipherCatalogItem |
diffFileCipherItems       |
areSameCatalogItem      |
normalizeSourceFilepath   |
calcMacFromFile           | Calc mac (Message Authentication Code) from fle.
calcFingerprintFromMac    | Calc fingerprint from mac.
calcFingerprintFromString | Calc fingerprint from literal string.
calcFingerprintFromFile   | Calc fingerprint from file.



[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/helper-cipher-file@6.0.0-alpha.12/packages/helper-cipher-file#readme
