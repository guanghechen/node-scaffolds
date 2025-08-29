<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/commander@1.0.11/packages/commander#readme">@guanghechen/commander</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/commander">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/commander.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/commander">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/commander.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/commander">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/commander.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/commander"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="ESLint Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/commander/peer/jest"
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

* npm

  ```bash
  npm install --save-dev @guanghechen/commander
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/commander
  ```

## Usage

This package extends [commander.js][] with enhanced functionality for building CLI applications with configuration management and sub-command support.

### Enhanced Command Class

```typescript
import { Command, type ICommandActionCallback } from '@guanghechen/commander'

interface IMyOptions extends ICommandConfigurationOptions {
  readonly input: string
  readonly output: string
}

const command = new Command()
  .name('my-tool')
  .description('My awesome CLI tool')
  .action<IMyOptions>((args, options, extra, self) => {
    console.log('Arguments:', args)
    console.log('Options:', options)
    console.log('Extra args:', extra)
  })
```

### Creating Top-Level Commands

```typescript
import { createTopCommand } from '@guanghechen/commander'

const program = createTopCommand('my-cli', '1.0.0')
// The command comes pre-configured with:
// - Configuration file options (--config-path, --parastic-config-path, etc.)
// - Logging options (--log-level, --log-encoding, etc.)
// - Workspace option (--workspace)
```

### Main Command Utilities

```typescript
import {
  createMainCommandMounter,
  createMainCommandExecutor,
  type IMainCommandProcessor,
  type IMainCommandCreator
} from '@guanghechen/commander'

// Define your main command processor
const processor: IMainCommandProcessor<IMyOptions> = async (options) => {
  console.log('Processing with options:', options)
}

// Create a command creator
const creator: IMainCommandCreator<IMyOptions> = (handle) => {
  return new Command()
    .name('build')
    .description('Build the project')
    .action(handle ? (opts) => handle(opts) : () => {})
}

// Create and use a mounter for adding to parent command
const mounter = createMainCommandMounter(creator, processor)
mounter(program)

// Or create an executor for direct execution
const executor = createMainCommandExecutor(creator, processor)
await executor(process.argv)
```

### Sub-Command Architecture

```typescript
import { SubCommand, type ISubCommandOptions, type ISubCommandProcessor } from '@guanghechen/commander'

interface IBuildOptions extends ISubCommandOptions {
  readonly target: string
  readonly production: boolean
}

class BuildCommand extends SubCommand<IBuildOptions> {
  public readonly subCommandName = 'build'
  public readonly aliases = ['b']

  public command(processor: ISubCommandProcessor<IBuildOptions>): Command {
    return new Command()
      .name(this.subCommandName)
      .aliases(this.aliases)
      .description('Build the project')
      .option('--target <target>', 'Build target', 'development')
      .option('--production', 'Production build', false)
      .action(async (args, options, extra) => {
        await processor.process(args, options)
      })
  }

  public async resolveProcessor(args: string[], options: IBuildOptions): Promise<ISubCommandProcessor<IBuildOptions>> {
    return {
      process: async (args, options) => {
        console.log(`Building for ${options.target}`)
        if (options.production) {
          console.log('Production mode enabled')
        }
      }
    }
  }
}

// Usage
const buildCmd = new BuildCommand()
buildCmd.mount(program, { isDefault: false })
```

### Utility Functions

```typescript
import { hasGitInstalled, installDependencies } from '@guanghechen/commander'

// Check if Git is available
if (hasGitInstalled()) {
  console.log('Git is available')
}

// Install dependencies with user selection
await installDependencies({
  cwd: process.cwd(),
  plopBypass: [], // Or ['yarn'] to skip user prompt
  reporter: myReporter
})
```

## API Reference

| Name | Signature | Description |
|------|-----------|-------------|
| `Command` | Class | Enhanced version with improved TypeScript support |
| `SubCommand` | `abstract class SubCommand<O>` | Abstract base class for implementing sub-commands with configuration support |
| `createTopCommand` | `(commandName: string, version: string) => Command` | Creates a top-level command with pre-configured common options |
| `createMainCommandMounter` | `<O>(creator, handle) => IMainCommandMounter` | Creates a function for mounting main commands to parent commands |
| `createMainCommandExecutor` | `<O>(creator, handle) => IMainCommandExecutor` | Creates a function for executing main commands directly |
| `hasGitInstalled` | `() => boolean` | Checks if Git is installed and available in PATH |
| `installDependencies` | `(params) => Promise<void>` | Prompts user to install dependencies using npm or yarn |

### Detailed Interfaces

#### `Command` Class Methods

```typescript
class Command {
  action<T>(fn: ICommandActionCallback<T>): this  // Register action callback with enhanced type safety
  opts<T>(): T                                   // Get options with proper type inference
}
```

#### `SubCommand<O>` Abstract Class

```typescript
abstract class SubCommand<O extends ISubCommandOptions> {
  // Abstract properties
  abstract readonly subCommandName: string      // The name of the sub-command
  abstract readonly aliases: string[]           // Command aliases

  // Abstract methods
  abstract command(processor: ISubCommandProcessor<O>): Command
  abstract resolveProcessor(args: string[], options: O): Promise<ISubCommandProcessor<O>>

  // Instance methods
  mount(parentCommand: Command, opts?: { isDefault?: boolean }): void
  execute(parentCommand: Command, rawArgs: string[]): Promise<void>
  process(args: string[], options: O): Promise<void>
}
```

#### `createTopCommand` Pre-configured Options

The command comes with these built-in options:

```typescript
--config-path, -c          // Configuration file paths
--parastic-config-path     // Parasitic configuration file path
--parastic-config-entry    // Entry key in parasitic config
--workspace               // Working directory
--log-level              // Logging level
--log-encoding           // Log file encoding
--log-filepath           // Log file path
--log-name              // Logger name
--log-mode              // Log format mode
--log-flight            // Logger flight options
```

#### `installDependencies` Parameters

```typescript
interface IInstallDependenciesParams {
  cwd: string                    // Working directory
  plopBypass: string[]          // Pre-selected choices to bypass prompts
  reporter?: IReporter          // Optional logger
}
```

#### Type Definitions

```typescript
// Action callback function signature
type ICommandActionCallback<T> = (
  args: string[],
  options: T,
  extra: string[],
  self: Command,
) => void | Promise<void> | never

// Sub-command processor interface
interface ISubCommandProcessor<O> {
  process(args: string[], options: O): Promise<void>
}

// Base interface for sub-command options
interface ISubCommandOptions extends ICommandConfigurationOptions {
  // Inherits all configuration options
}
```

## Related

* [commander.js][]


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/commander@1.0.11/packages/commander#readme
[commander.js]: https://github.com/tj/commander.js/

