<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/release-5.x.x/packages/helper-cipher#readme">@guanghechen/helper-cipher</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/helper-cipher">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/helper-cipher.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-cipher">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/helper-cipher.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-cipher">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/helper-cipher.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/helper-cipher"
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

Utility functions for cipher contents or files.


## Install

* npm

  ```bash
  npm install --save @guanghechen/helper-cipher
  ```

* yarn

  ```bash
  yarn add @guanghechen/helper-cipher
  ```

## Usage

* `AESCipher`

  ```typescript
  import { AESCipher } from '@guanghechen/helper-cipher'

  const cipher = new AESCipher()  // Some options
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
  import { AESCipher, CipherCatalog } from '@guanghechen/helper-cipher'
  import path from 'node:path'

  const password = Buffer.from('password, such as `@guanghechen/helper-cipher`') 
  const cipher = new AESCipher()
  cipher.initFromPassword(password)

  const catalog = new CipherCatalog({
    cipher,
    sourceRootDir: path.join(__dirname, 'workspace/source'),
    encryptedRootDir: path.join(__dirname, 'workspace/target'),
  })

  catalog.calcAbsoluteSourceFilepath('a.md')              // Resolve the absolute path of a source file.
  catalog.calcAbsoluteEncryptedFilepath('a.md')              // Resolve the absolute path of a target file.
  catalog.calcRelativeSourceFilepath('<WORKSPACE>/a.md')  // Resolve the relative path of the source file.
  catalog.calcRelativeEncryptedFilepath('<WORKSPACE>/a.md')  // Resolve the relative path of the target file.
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
`AESCipher`                   | A ICipher implementation with AES algorithm.
`CipherCatalog`                     | Catalog for managing source / target files and relationship maps



[homepage]: https://github.com/guanghechen/node-scaffolds/tree/release-5.x.x/packages/helper-cipher#readme
