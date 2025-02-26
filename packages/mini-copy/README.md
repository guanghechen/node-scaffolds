<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/mini-copy@6.0.3/packages/mini-copy#readme">@guanghechen/mini-copy</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/mini-copy">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/mini-copy.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/mini-copy">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/mini-copy.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/mini-copy">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/mini-copy.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/mini-copy"
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


`mini-copy` based on [clipboardy](https://www.npmjs.com/package/clipboardy), it support sharing the
clipboard with windows and wsl. But sometimes there has some messy code problem when using both the
terminal in wsl and windows, i.e. copy content from `cmd.exe`, and run demo3 in windows terminal.
To solve this problem, you could try copy the `node_modules/clipboardy/fallbacks/windows/clipboard_*.exe`
(depends on your machine's architecture) to `/mnt/<d|e|f|g>/clipboard.exe`.


## Install

* npm

  ```bash
  npm install --save @guanghechen/mini-copy
  ```

* yarn

  ```bash
  yarn add @guanghechen/mini-copy
  ```

## Usage

```typescript
import { copy, paste } from '@guanghechen/mini-copy'

await copy('waw') // => write something to clipboard.
await paste()     // => read content from clipboard.
```


## Examples

* Basic.
  ```typescript
  import { copy, paste } from '@guanghechen/mini-copy'

  async function f(): Promise<void> {
    const string = '中国，here，hello world，好的，哦哦'
    await copy(string)
    const p = await paste()
    console.log(`#${p}#`)
  }

  void f().catch(e => console.error(e))
  ```

* Use Fake clipboard as fallback.
  ```typescript
  import { ChalkLogger, DEBUG } from '@guanghechen/chalk-logger'
  import { FakeClipboard, copy, paste } from '@guanghechen/mini-copy'
  import path from 'node:path'

  const logger = new ChalkLogger({
    name: 'mini-copy',
    colorful: true,
    date: true,
    inline: false,
    level: DEBUG,
  })

  const fakeClipboard = new FakeClipboard({
    filepath: path.resolve(__dirname, 'fake-clipboard.txt'),
    encoding: 'utf8',
    logger,
  })

  async function f(): Promise<void> {
    const string = '中国，here，hello world，好的，哦哦\n'
    await copy(string, { logger, fakeClipboard })
    const p = await paste({ logger, fakeClipboard })
    console.log(`#${p}#`)
  }

  void f().catch(e => console.error(e))
  ```


* Use custom logger.

  ```typescript
  import { ChalkLogger, DEBUG } from '@guanghechen/chalk-logger'
  import { copy, paste } from '@guanghechen/mini-copy'

  const logger = new ChalkLogger({
    name: 'mini-copy',
    colorful: true,
    date: true,
    inline: false,
    level: DEBUG,
  })

  async function f(): Promise<void> {
    const string = '中国，here，hello world，好的，哦哦\n'
    await copy(string, { logger })
    const p = await paste({ logger })
    console.log(`#${p}#`)
  }

  void f().catch(e => console.error(e))
  ```


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/mini-copy@6.0.3/packages/mini-copy#readme
