<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/cli@1.0.8/packages/cli#readme">@guanghechen/cli</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/cli">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/cli.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/cli">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/cli.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/cli">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/cli.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/cli"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="ESLint Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/cli/peer/jest"
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

Utility functions for creating command program tools based on [commander.js][].

## Install

- npm

  ```bash
  npm install --save-dev @guanghechen/cli
  ```

- yarn

  ```bash
  yarn add --dev @guanghechen/cli
  ```

## Usage

This package provides essential utilities for building CLI applications with configuration management, command detection, and various helper functions.

### Configuration Management

```typescript
import {
  resolveCommandConfigurationOptions,
  type ICommandConfigurationOptions,
  type ICommandConfigurationFlatOpts
} from '@guanghechen/cli'

interface IMyOptions extends ICommandConfigurationOptions {
  readonly input: string
  readonly output: string
}

const resolvedOptions = resolveCommandConfigurationOptions<IMyOptions>({
  commandName: 'my-command',
  defaultOptions: {
    input: './src',
    output: './dist'
  },
  reporter: myReporter,
  options: cliOptions,
  subCommandName: 'build',
  workspace: process.cwd()
})
```

### Command Existence Detection

```typescript
import { commandExists, commandExistsSync } from '@guanghechen/cli'

// Asynchronous check
const hasGit = await commandExists('git')

// Synchronous check  
const hasNode = commandExistsSync('node')
```

### Configuration File Loading

```typescript
import { loadConfig, detectConfigFileType, ConfigFileType } from '@guanghechen/cli'

// Load JSON configuration
const config = loadConfig('./my-config.json')

// Detect file type
const fileType = detectConfigFileType('./config.json') // Returns ConfigFileType.JSON
```

### ANSI String Processing

```typescript
import { stripAnsi } from '@guanghechen/cli'

const coloredText = '\u001b[31mRed text\u001b[0m'
const plainText = stripAnsi(coloredText) // 'Red text'
```

### Reading from STDIN

```typescript
import { readFromStdin } from '@guanghechen/cli'

const input = await readFromStdin('utf8')
console.log('User input:', input)
```

### Option Merging

```typescript
import { merge, type IMergeStrategy, type IMergeStrategyMap } from '@guanghechen/cli'

const options1 = { files: ['a.js'], verbose: false }
const options2 = { files: ['b.js'], verbose: true }

const strategyMap: Partial<IMergeStrategyMap<typeof options1>> = {
  files: (prev, next) => [...prev, ...(next || [])]
}

const merged = merge([options1, options2], strategyMap)
// Result: { files: ['a.js', 'b.js'], verbose: true }
```

## API Reference

| Name | Signature | Description |
|------|-----------|-------------|
| `resolveCommandConfigurationOptions` | `<O>(params) => O & ICommandConfigurationFlatOpts` | Resolves command configuration options by merging defaults, configs, and runtime options |
| `commandExists` | `(commandName: string) => Promise<boolean>` | Asynchronously checks if a command exists in the system PATH |
| `commandExistsSync` | `(commandName: string) => boolean` | Synchronously checks if a command exists in the system PATH |
| `loadConfig` | `(filepath: string, encoding?) => unknown` | Loads and parses a configuration file (currently supports JSON) |
| `detectConfigFileType` | `(filepath: string) => ConfigFileType \| null` | Detects the configuration file type based on file extension |
| `stripAnsi` | `(content: string) => string` | Removes ANSI escape codes from a string |
| `readFromStdin` | `(encoding: BufferEncoding) => Promise<string>` | Reads content from standard input |
| `merge` | `<O>(options: O[], strategyMap?, defaultStrategy?) => O` | Merges multiple option objects using custom strategies |

### Detailed Interfaces

#### `resolveCommandConfigurationOptions` Parameters

```typescript
interface IResolveCommandConfigurationOptionsParams<O extends ICommandConfigurationOptions> {
  commandName: string                             // Name of the command
  defaultOptions: O | ((params) => O)            // Default options or factory function
  reporter: IReporter                             // Logger instance for debugging
  options: Partial<O>                             // Runtime options to merge
  strategyMap?: Partial<IMergeStrategyMap<O>>     // Custom merge strategies
  subCommandName: string | false                 // Sub-command name for specific config
  workspace: string | undefined                  // Working directory
}
```

#### `ICommandConfigurationOptions`

Base interface for command configuration options.

```typescript
interface ICommandConfigurationOptions {
  readonly logLevel?: 'debug' | 'verbose' | 'info' | 'warn' | 'error' | ReporterLevelEnum | string
  readonly configPath?: string[]
  readonly parasticConfigPath?: string | null
  readonly parasticConfigEntry?: string | null
  readonly workspace?: string
}
```

#### `ICommandConfiguration<IOptions>`

Configuration structure supporting global and sub-command specific options.

```typescript
interface ICommandConfiguration<IOptions extends ICommandConfigurationOptions> {
  __globalOptions__: IOptions
  [subCommand: string]: IOptions
}
```

#### `IMergeStrategy<T>`

Strategy function for merging option values.

```typescript
type IMergeStrategy<T = unknown> = (prevValue: T, nextValue: T | null) => T

type IMergeStrategyMap<O extends object> = {
  [K in keyof O]: IMergeStrategy<O[K]>
}
```

## Related

- [commander.js][]

[homepage]:
  https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/cli@1.0.8/packages/cli#readme
[commander.js]: https://github.com/tj/commander.js/
