<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/release-4.x.x/packages/chalk-logger#readme">@guanghechen/chalk-logger</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/chalk-logger">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/chalk-logger.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/chalk-logger">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/chalk-logger.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/chalk-logger">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/chalk-logger.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/chalk-logger"
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


`chalk-logger` is a colorful logger tool based on [chalk][] (so you can use a
lot of colors), and can be easily integrated into [commander.js][] (so you can
use command line parameters to customized the logger's behavior).


## Install

* npm

  ```bash
  npm install --save @guanghechen/chalk-logger
  ```

* yarn

  ```bash
  yarn add @guanghechen/chalk-logger
  ```

## Usage

### Options
Name                | Type                    | Required  | Default           |  Desc
:------------------:|:-----------------------:|:---------:|:-----------------:|:---------------------------------------------:
`basename`          | string \| `null`        | `false`   | `null`            | [see below](#option-details)
`mode`              | `'normal'` \| `'loose'` | `false`   | `normal`          | [see below](#option-details)
`placeholderRegex`  | RegExp                  | `false`   | `/(?<!\\)\{\}/g`  | string formatter placeholder regex
`name`              | string                  | `false`   | -                 | name of logger
`level`             | Level                   | `false`   | `Level.INFO`      | verbosity level of the logging output
`flags`             | See below               | `false`   | -                 | feature flags
`write`             | (text: string) => void  | `false`   | `process.stdout`  | [see below](#option-details)

### Option Details

* `basename`: Base of the logger name, when you change logger name according
  `setName` function, the basename will be prefixed of the logger name.

* `mode`

  - `normal`: Print log only
  - `loose`: Print a newline before and after the log

* `flags`

  ```typescript
  interface ILoggerFlags {
    date?: boolean
    title?: boolean
    inline?: boolean
    colorful?: boolean
  }
  ```

  Flag        | Type    | Required  | Default |  Desc
  :----------:|:-------:|:---------:|:-------:|:---------------------------------------------:
  `date`      | boolean | `false`   | `false` | whether to print the date
  `title`     | boolean | `false`   | `true`  | whether to print the title
  `inline`    | boolean | `false`   | `false` | whether to print each log on one line
  `colorful`  | boolean | `false`   | `true`  | whether to print log surrounded with color

* `write`: If `filepath` is specified, the log is output to `filepath` by default,
  otherwise to the `process.stdout`.  You can specify your own write function to
  customize the output behavior of the log.


### Cli Options

* `--log-level <debug|verbose|info|warn|error|fatal>`: specify global logger level.

* `--log-name <new logger name>`: specify global logger name.

* `--log-mode <'normal' | 'loose'>`: specify global logger mode.

* `--log-flag <[no-](date|title|inline|colorful)>`: the prefix `no-` represent negation.

  - `date`: whether to print date. default value is false
  - `title`: whether to print title. default value is true
  - `inline`: each log record output in one line. default value is false.
  - `colorful`: whether to print with colors. default value is true.


## Test

Use [@guanghechen/helper-jest][] to spy logger.

```typescript
import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import {
  composeStringDesensitizers,
  createFilepathDesensitizer,
  createJsonDesensitizer,
  createLoggerMock,
} from '@guanghechen/helper-jest'

const workspaceRootDir = path.resolve(__dirname, '..')
const desensitize = createJsonDesensitizer({
  string: composeStringDesensitizers(
    createFilepathDesensitizer(workspaceRootDir, '<$WORKSPACE$>'),
    text => text.replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, '<$Date$>'),
  ),
})

const logger = new ChalkLogger({ name: 'demo', level: Level.DEBUG, flags: { date: true } })
const loggerMock = createLoggerMock({ logger, desensitize })

// collect data
loggerMock.getIndiscriminateAll()

// reset mock
loggerMock.reset()

// restore mock
loggerMock.restore()
```


## Examples

* Basic:

  ```typescript
  // demo/demo1.ts
  import { ChalkLogger, Level } from '@guanghechen/chalk-logger'

  const logger = new ChalkLogger(
    {
      name: 'demo1',
      level: Level.ERROR, // the default value is INFO
      flags: {
        date: false, // the default value is false.
        colorful: true, // the default value is true.
      },
    },
    process.argv,
  )

  logger.debug('A', 'B', 'C')
  logger.verbose('A', 'B', 'C')
  logger.info('a', 'b', 'c')
  logger.warn('X', 'Y', 'Z', { a: 1, b: 2 })
  logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
  logger.fatal('1', '2', '3')
  ```

  ![demo1.1.png][]

* Custom output format:

  ```typescript
  // demo/demo2.ts
  import { ChalkLogger, Level } from '@guanghechen/chalk-logger'

  const logger = new ChalkLogger(
    {
      name: 'demo2',
      level: Level.ERROR, // the default value is INFO
      flags: {
        date: false, // the default value is false.
        colorful: true, // the default value is true.
      },
    },
    process.argv,
  )

  logger.formatHeader = 
  function formatHeader(level: Level, date: Date): string {
      const dateText: string = this.flags.date
        ? this.formatContent(level, date.toLocaleTimeString())
        : ''

      const levelStyle = this.levelStyleMap[level]
      let levelText = levelStyle.title
      if (this.flags.colorful) {
        levelText = levelStyle.labelChalk.fg(levelText)
        if (levelStyle.labelChalk.bg != null) levelText = levelStyle.labelChalk.bg(levelText)
      }

      const titleText: string = this.flags.title
        ? this.formatContent(level, '<' + this.name + '>')
        : ''

      let result = ''
      if (dateText) result += dateText + ' '
      result += levelText
      if (titleText) result += ' ' + titleText
      return result
    }

  logger.debug('A', 'B', 'C')
  logger.verbose('A', 'B', 'C')
  logger.info('a', 'b', 'c')
  logger.warn('X', 'Y', 'Z', { a: 1, b: 2 })
  logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
  logger.fatal('1', '2', '3')
  ```

  ![demo2.1.png][]


* Custom colors with [chalk][]:

  ```typescript
  // demo/demo3.ts
  import { ChalkLogger, Level } from '@guanghechen/chalk-logger'

  const logger = new ChalkLogger(
    {
      name: 'demo3',
      level: Level.ERROR, // the default value is INFO
      flags: {
        date: false, // the default value is false.
        colorful: true, // the default value is true.
      },
    },
    process.argv,
  )

  logger.debug('A', 'B', 'C')
  logger.verbose('A', 'B', 'C')
  logger.info('a', 'b', 'c')
  logger.warn('X', 'Y', 'Z', { a: 1, b: 2 })
  logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
  logger.fatal('1', '2', '3')
  ```

  ![demo3.1.png][]

* Output to file

  ```typescript
  // demo/demo4.ts
  import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
  import fs from 'node:fs'
  import path from 'node:path'
  import url from 'node:url'

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

  const logFilepath = path.resolve(__dirname, 'orz.log')
  const logger = new ChalkLogger(
    {
      name: 'demo4',
      level: Level.DEBUG, // the default value is DEBUG
      flags: {
        date: true, // the default value is false.
        inline: true,
        colorful: false, // the default value is true.
      },
      write: text => fs.appendFileSync(logFilepath, text, 'utf-8'),
    },
    process.argv,
  )

  logger.debug('A', 'B', 'C')
  logger.verbose('A', 'B', 'C')
  logger.info('a', 'b', 'c')
  logger.warn('X', 'Y', 'Z', { a: 1, b: 2 })
  logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
  logger.fatal('1', '2', '3')
  ```

  ![demo4.1.png][]

* With [commander.js][]:

  ```typescript
  // demo/demo5.ts
  import { ChalkLogger, Level, registerCommanderOptions } from '@guanghechen/chalk-logger'
  import { Command } from 'commander'

  const logger = new ChalkLogger(
    {
      name: 'demo5',
      level: Level.ERROR, // the default value is INFO
      flags: {
        date: false, // the default value is false.
        colorful: true, // the default value is true.
      },
    },
    process.argv,
  )

  const command = new Command()
  command.version('v1.0.0').arguments('[orz]')

  // register logger option to commander
  registerCommanderOptions(command)

  command.option('-e, --encoding <encoding>', "specified <filepath>'s encoding").parse(process.argv)

  logger.debug('A', 'B', 'C')
  logger.verbose('A', 'B', 'C')
  logger.info('a', 'b', 'c')
  logger.warn('X', 'Y', 'Z', { a: 1, b: 2 })
  logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
  logger.fatal('1', '2', '3')
  ```

  ![demo5.1.png][]

* String format:

  ```typescript
  // demo/demo6.ts
  import { ChalkLogger, Level } from '@guanghechen/chalk-logger'

  const logger = new ChalkLogger(
    {
      name: 'demo6',
      level: Level.DEBUG,
      flags: {
        date: true,
        colorful: true,
        inline: true,
      },
    },
    process.argv,
  )

  logger.verbose('user({})', {
    username: 'lemon-clown',
    avatar:
      'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4',
  })
  logger.error('bad argument ({}). error({})', { username: 123 }, new Error('username is invalid'))

  const logger2 = new ChalkLogger(
    {
      name: 'demo6',
      level: Level.DEBUG,
      flags: {
        date: true,
        colorful: true,
        inline: true,
      },
      placeholderRegex: /(?<!\\)<>/g, // change placeholder of string format
    },
    process.argv,
  )

  logger2.verbose('user(<>)', {
    username: 'lemon-clown',
    avatar:
      'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4',
  })
  logger2.error('bad argument (<>). error({})', { username: 123 }, new Error('username is invalid'))
  ```

  ![demo6.1.png][]

* No title:

  ```typescript
  import { ChalkLogger, Level } from '@guanghechen/chalk-logger'

  const logger = new ChalkLogger(
    {
      name: 'demo7',
      level: Level.DEBUG,
      flags: {
        date: true,
        title: false,
        colorful: true,
        inline: true,
      },
    },
    process.argv,
  )

  logger.debug('A', 'B', 'C')
  logger.verbose('A', 'B', 'C')
  logger.info('a', 'b', 'c')
  logger.warn('X', 'Y', 'Z', { a: 1, b: 2 })
  logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
  logger.fatal('1', '2', '3')

  const logger2 = new ChalkLogger(
    {
      name: 'demo7',
      level: Level.DEBUG,
      flags: {
        date: false,
        title: false,
        colorful: true,
        inline: true,
      },
      placeholderRegex: /(?<!\\)<>/g, // change placeholder of string format
    },
    process.argv,
  )

  logger2.debug('A', 'B', 'C')
  logger2.verbose('A', 'B', 'C')
  logger2.info('a', 'b', 'c')
  logger2.warn('X', 'Y', 'Z', { a: 1, b: 2 })
  logger2.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
  logger2.fatal('1', '2', '3')
  ```

  ![demo7.1.png][]


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/release-4.x.x/packages/chalk-logger#readme
[@yozora/helper-jest]: https://www.npmjs.com/package/@guanghechen/helper-jest
[demo1.1.png]: https://raw.githubusercontent.com/guanghechen/node-scaffolds/main/packages/chalk-logger/screenshots/demo1.1.png
[demo2.1.png]: https://raw.githubusercontent.com/guanghechen/node-scaffolds/main/packages/chalk-logger/screenshots/demo2.1.png
[demo3.1.png]: https://raw.githubusercontent.com/guanghechen/node-scaffolds/main/packages/chalk-logger/screenshots/demo3.1.png
[demo4.1.png]: https://raw.githubusercontent.com/guanghechen/node-scaffolds/main/packages/chalk-logger/screenshots/demo4.1.png
[demo5.1.png]: https://raw.githubusercontent.com/guanghechen/node-scaffolds/main/packages/chalk-logger/screenshots/demo5.1.png
[demo6.1.png]: https://raw.githubusercontent.com/guanghechen/node-scaffolds/main/packages/chalk-logger/screenshots/demo6.1.png
[demo7.1.png]: https://raw.githubusercontent.com/guanghechen/node-scaffolds/main/packages/chalk-logger/screenshots/demo7.1.png
[chalk]: https://github.com/chalk/chalk
[commander.js]: https://github.com/tj/commander.js
