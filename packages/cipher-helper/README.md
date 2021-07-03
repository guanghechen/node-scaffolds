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

* `CipherCatalog`

  ```typescript
  import { AESCipherHelper, CipherCatalog } from '@guanghechen/cipher-helper'
  import path from 'path'

  const password = Buffer.from('password, such as `@guanghechen/cipher-helper`') 
  const cipher = new AESCipherHelper()
  cipher.initFromPassword(password)

  const catalog = new CipherCatalog({
    cipher,
    sourceRootDir: path.join(__dirname, 'workspace/source'),
    targetRootDir: path.join(__dirname, 'workspace/target'),
  })

  catalog.calcAbsoluteSourceFilepath('a.md')              // Resolve the absolute path of a source file.
  catalog.calcAbsoluteTargetFilepath('a.md')              // Resolve the absolute path of a target file.
  catalog.calcRelativeSourceFilepath('<WORKSPACE>/a.md')  // Resolve the relative path of the source file.
  catalog.calcRelativeTargetFilepath('<WORKSPACE>/a.md')  // Resolve the relative path of the target file.
  catalog.checkIntegrity()                                // Check if the index file is damaged.
  catalog.cleanup()                                       // Perform cleanup operations.
  catalog.decryptAll(bakSourceRootDir)                    // Decrypt all target files and output into the given directory.
  catalog.dump()                                          // Dump catalog states.
  catalog.isModified('a.md')                              // Test whether the given file has changed. (provide a simple filtering for continued operations)
  catalog.load(cipheredCatalogIndex)                      // Load states from ciphered data string
  catalog.loadFroMFile('catalog.txt')                     // Load states from index files.
  catalog.reset()                                         // Reset inner states.
  catalog.save('catalog.index.txt')                       // Dump catalog data and save into the index file.
  catalog.register(sourceFilepath)                        // Register a item into the catalog and perform some cleanup operations.
  catalog.touch()                                         // Synchronize the lastCheckTime.
  ```


### Overview

Name                                | Description
:----------------------------------:|:----------------------------:
`calcFingerprint`                   | Calc fingerprint of Buffer contents
`calcMac`                           | Calc mac (Message Authentication Code)
`calcMacFromFile`                   | Calc mac (Message Authentication Code) from file
`createRandomIv`                    | Create random initial vector
`createRandomKey`                   | Create random key of aes
`destroyBuffer`                     | Fill buffer with a random number
`destroyBuffers`                    | Fill buffers with random numbers
`streams2buffer`                    | Merge multiple read streams into Buffer serially
`AESCipherHelper`                   | A CipherHelper implementation with AES algorithm.
`CipherCatalog`                     | Catalog for managing source / target files and relationship maps



[homepage]: https://github.com/guanghechen/node-scaffolds/tree/main/packages/cipher-helper#readme
