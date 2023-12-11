<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/tool-git-cipher@6.0.0-alpha.15/packages/tool-git-cipher#readme">@guanghechen/tool-git-cipher</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/tool-git-cipher">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/tool-git-cipher.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/tool-git-cipher">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/tool-git-cipher.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/tool-git-cipher">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/tool-git-cipher.svg"
      />
    </a>
    <a href="#install">
      <img
        alt="Module Formats: cjs"
        src="https://img.shields.io/badge/module_formats-cjs-green.svg"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Eslint Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/tool-git-cipher/peer/jest"
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


* Fully encrypt the git repository

  - Prepare a directory `plaintextRootDir`, which tracks (or uses it as the 
    source repository directly) the git repository to be encrypted. Every time
    the encrypt command is executed, the content under the path `plaintextRootDir`
    will be encrypted and stored into directory `ciphertextRootDir`, and the
    structure of the file will be saved in `indexFilepath`.

  - Support incremental update content, determine whether the file needs to be
    re-encrypted by comparing the latest modified time of the source file.

  - The secret key to encrypt the `plaintextRootDir` directory is encrypted by
    a password entered by the user and saved in the `secretFilepath` file. This
    file also saves the encrypted result of the mac value of the original key,
    which is used to verify whether the subsequent input password is correct.

  - Default algorithm `AES-256 gcm`.


## Install

* npm

  ```bash
  npm install -g @guanghechen/tool-git-cipher
  ```

* yarn

  ```bash
  yarn global add @guanghechen/tool-git-cipher
  ```


## Examples

* Basic:

  You can specify configs into `package.json` like below:

  ```json
  {
    "name": "private-repository-demo",
    "version": "0.0.0",
    "private": true,
    "scripts": {
      "encrypt": "ghc-git-cipher encrypt .",
      "decrypt": "ghc-git-cipher decrypt ."
    },
    "devDependencies": {
      "@guanghechen/tool-git-cipher": "^4.0.0-alpha.3"
    },
    "@guanghechen/tool-git-cipher": {
      "__globalOptions__": {
        "catalogFilepath": "ghc-crypt/.ghc-catalog",
        "cryptRootDir": "ghc-crypt",
        "encoding": "utf8",
        "cryptFilesDir": "encrypted",
        "cryptFilepathSalt": "",
        "keepPlainPatterns": [
          ".gitignore",
          ".npmrc",
          ".nvmrc",
          ".yarnrc",
          "package.json",
          "yarn.lock",
          ".ghc-secret"
        ],
        "logLevel": "info",
        "minPasswordLength": 6,
        "partCodePrefix": ".ghc-part",
        "pbkdf2Options": {
          "salt": "guanghechen",
          "digest": "sha256",
          "iterations": 100000,
          "keylen": 32
        },
        "secretFilepath": ".ghc-secret",
        "showAsterisk": true
      },
      "encrypt": {
        "catalogCacheFilepath": ".ghc-cache-catalog.json"
      },
      "decrypt": {}
    }
  }
  ```

  While `__globalOptions__` is the global option, `encrypt` is the option for
  the sub-command `encrypt` and etc.


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/tool-git-cipher@6.0.0-alpha.15/packages/tool-git-cipher#readme
