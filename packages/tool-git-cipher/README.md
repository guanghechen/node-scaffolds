<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/release-3.x.x/packages/tool-git-cipher#readme">@guanghechen/tool-git-cipher</a>
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

## Usage

* init
  ```shell
  ghc-git-cipher init <workspace dir>
  ```

* encrypt
  ```shell
  ghc-git-cipher encrypt <workspace dir>
  ```

* decrypt
  ```shell
  ghc-git-cipher decrypt <workspace dir>
  ```

### Options

## Overview

```shell
$ ghc-git-cipher --help

Usage: ghc-git-cipher [options] [command]

Options:
  -V, --version                                       output the version number
  --log-level <level>                                 specify logger's level.
  --log-name <name>                                   specify logger's name.
  --log-mode <'normal' | 'loose'>                     specify logger's name.
  --log-flag <option>                                 specify logger' option. [[no-]<date|colorful|inline>] (default: [])
  --log-output <filepath>                             specify logger' output path.
  --log-encoding <encoding>                           specify output file encoding.
  -c, --config-path <config filepath>                  (default: [])
  --parastic-config-path <parastic config filepath>
  --parastic-config-entry <parastic config filepath>
  --encoding <encoding>                               default encoding of files in the workspace
  --secret-filepath <secretFilepath>                  path of secret file
  --index-filepath <indexFilepath>                    path of index file of ciphertext files
  --ciphered-index-encoding <cipheredIndexEncoding>   encoding of ciphered index file
  --ciphertext-root-dir <ciphertextRootDir>           the directory where the encrypted files are stored
  --plaintext-root-dir <plaintextRootDir>             the directory where the source plaintext files are stored
  --show-asterisk                                     whether to print password asterisks
  --minimum-password-length                           the minimum size required of password
  -h, --help                                          display help for command

Commands:
  init|i <workspace>
  encrypt|e [options] <workspace>
  decrypt|d <workspace>
  help [command]                                      display help for command
```

### init

```shell
$ ghc-git-cipher init --help

Usage: ghc-git-cipher init|i [options] <workspace>

Options:
  -h, --help  display help for command
```

### encrypt

```shell
$ ghc-git-cipher encrypt --help

Usage: ghc-git-cipher encrypt|e [options] <workspace>

Options:
  --full                   full quantity update
  --update-before-encrypt  perform 'git fetch --all' before run encryption
  -h, --help               display help for command
```

Additional configs:

Name                    | Default   | Description
:----------------------:|:---------:|:----------------------:
`sensitiveDirectories`  | `['git']` | List of directories that needed to be encrypted under the `plaintextRootDir`

### decrypt

```shell
$ ghc-git-cipher decrypt --help

Usage: ghc-git-cipher decrypt|d [options] <workspace>

Options:
  --out-dir <outDir>  root dir of outputs (decrypted files)
  -h, --help          display help for command
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
      "@guanghechen/tool-git-cipher": "^0.0.23"
    },
    "@guanghechen/tool-git-cipher": {
      "__globalOptions__": {
        "logLevel": "info",
        "encoding": "utf8",
        "secretFilepath": ".ghc-secret",
        "indexFilepath": ".ghc-index",
        "cipheredIndexEncoding": "base64",
        "ciphertextRootDir": "ghc-ciphertext",
        "plaintextRootDir": "ghc-plaintext",
        "showAsterisk": true,
        "maxTargetFileSize": 104857600  // 100 MB
      },
      "encrypt": {
        "updateBeforeEncrypt": true
      },
      "decrypt": {
        "outDir": "ghc-plaintext-bak"
      }
    }
  }
  ```

  While `__globalOptions__` is the global option, `encrypt` is the option for
  the sub-command `encrypt` and etc.


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/release-3.x.x/packages/tool-git-cipher#readme
