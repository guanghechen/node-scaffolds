<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/exec@1.0.8/packages/exec#readme">@guanghechen/exec</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/exec">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/exec.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/exec">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/exec.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/exec">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/exec.svg"
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
        src="https://img.shields.io/node/v/@guanghechen/exec"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="ESLint Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/exec/peer/jest"
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


Utils for running commands.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/exec
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/exec
  ```

## Usage

This package provides utilities for safely executing shell commands with enhanced error handling, logging, and configuration options.

### Basic Command Execution

```typescript
import { safeExec } from '@guanghechen/exec'

// Execute a simple command
const result = await safeExec({
  from: 'build-script',
  cmd: 'npm',
  args: ['run', 'build'],
  cwd: './project-directory'
})

console.log('Output:', result.stdout)
```

### Advanced Configuration

```typescript
import { safeExec } from '@guanghechen/exec'
import { ChalkLogger } from '@guanghechen/chalk-logger'

const logger = new ChalkLogger({ name: 'exec' })

// Execute with full configuration
const result = await safeExec({
  from: 'deployment',
  cmd: 'docker',
  args: ['build', '-t', 'my-app', '.'],
  cwd: '/path/to/project',
  env: {
    NODE_ENV: 'production',
    API_URL: 'https://api.example.com'
  },
  stdio: 'pipe',
  encoding: 'utf8',
  reporter: logger
})
```

### Git Operations

```typescript
import { safeExec } from '@guanghechen/exec'

// Get current git branch
const branch = await safeExec({
  from: 'git-utils',
  cmd: 'git',
  args: ['rev-parse', '--abbrev-ref', 'HEAD'],
  cwd: process.cwd()
})

console.log('Current branch:', branch.stdout)

// Clone repository
await safeExec({
  from: 'clone-repo',
  cmd: 'git',
  args: ['clone', 'https://github.com/user/repo.git', 'local-dir'],
  cwd: '/projects'
})
```

### Build Tools Integration

```typescript
import { safeExec } from '@guanghechen/exec'

// Run TypeScript compilation
await safeExec({
  from: 'build-ts',
  cmd: 'npx',
  args: ['tsc', '--project', './tsconfig.json'],
  cwd: './packages/core'
})

// Run tests
const testResult = await safeExec({
  from: 'test-runner',
  cmd: 'npm',
  args: ['test', '--', '--coverage'],
  cwd: process.cwd(),
  stdio: 'inherit' // Show output in real-time
})
```

### Error Handling

```typescript
import { safeExec } from '@guanghechen/exec'

try {
  await safeExec({
    from: 'risky-command',
    cmd: 'some-command',
    args: ['--dangerous-flag'],
    cwd: './temp'
  })
} catch (error) {
  console.error('Command failed:', error.message)
  // Error includes stdout/stderr output for debugging
}
```

### Multiple Commands

```typescript
import { safeExec } from '@guanghechen/exec'

async function buildProject() {
  // Clean
  await safeExec({
    from: 'clean',
    cmd: 'rm',
    args: ['-rf', 'dist'],
    cwd: process.cwd()
  })

  // Install dependencies
  await safeExec({
    from: 'install',
    cmd: 'npm',
    args: ['install'],
    cwd: process.cwd()
  })

  // Build
  await safeExec({
    from: 'build',
    cmd: 'npm',
    args: ['run', 'build'],
    cwd: process.cwd()
  })
}
```

## API Reference

| Name | Signature | Description |
|------|-----------|-------------|
| `safeExec` | `(params: ISafeExecParams) => Promise<ISafeExecResult>` | Executes a shell command safely with enhanced error handling and logging |

### Detailed Interfaces

#### `ISafeExecParams`

Parameters for safe command execution.

```typescript
interface ISafeExecParams {
  from: string                                     // Identifier for logging/debugging
  cmd: string                                      // Command to execute
  args: string[]                                   // Command arguments
  cwd?: string                                    // Working directory (default: process.cwd())
  env?: Record<string, string | undefined>       // Environment variables
  stdio?: 'pipe' | 'overlapped' | 'inherit' | 'ignore'  // Stdio configuration
  encoding?: BufferEncoding                       // Output encoding (default: 'utf8')
  reporter?: IReporter                           // Logger instance for debug/error output
}
```

#### `ISafeExecResult`

Result from command execution.

```typescript
interface ISafeExecResult {
  stdout: string                                 // Command output (trimmed)
}
```

### Parameter Details

#### `from: string`
An identifier used for logging and debugging. This helps track which part of your application initiated the command execution.

#### `cmd: string`
The command to execute. Can be a system command, npm script, or any executable available in PATH.

#### `args: string[]`
Array of arguments to pass to the command. Each argument should be a separate array element.

#### `cwd?: string`
Working directory where the command should be executed. Defaults to the current working directory.

#### `env?: Record<string, string | undefined>`
Environment variables to set for the command execution. These are merged with the current process environment.

#### `stdio?: 'pipe' | 'overlapped' | 'inherit' | 'ignore'`
Controls how the subprocess stdio is configured:
- `'pipe'` (default) - Capture output for programmatic use
- `'inherit'` - Show output in real-time in parent process
- `'ignore'` - Discard output
- `'overlapped'` - Windows-specific option

#### `encoding?: BufferEncoding`
Character encoding for the output. Defaults to `'utf8'`.

#### `reporter?: IReporter`
Logger instance for debug and error messages. Provides detailed execution information when debugging is enabled.

## Features

### Enhanced Error Handling
- Captures both stdout and stderr
- Provides detailed error messages with command context
- Graceful handling of process termination
- Clear error reporting with execution parameters

### Logging Integration
- Debug logging of all execution parameters
- Error logging with full context
- Integration with @guanghechen/reporter framework
- Execution tracking via `from` parameter

### Promise-based API
- Modern async/await support
- Proper error propagation
- Clean promise resolution/rejection

### Flexible Configuration
- Support for different stdio modes
- Custom environment variables
- Configurable working directory
- Customizable output encoding

## Common Use Cases

### CI/CD Scripts
```typescript
// Deploy application
await safeExec({
  from: 'deploy',
  cmd: 'kubectl',
  args: ['apply', '-f', 'deployment.yaml'],
  cwd: './k8s'
})
```

### Build Automation
```typescript
// Bundle assets
await safeExec({
  from: 'webpack',
  cmd: 'npx',
  args: ['webpack', '--mode', 'production'],
  env: { NODE_ENV: 'production' }
})
```

### Development Tools
```typescript
// Format code
await safeExec({
  from: 'format',
  cmd: 'npx',
  args: ['prettier', '--write', 'src/**/*.ts'],
  stdio: 'inherit'
})
```


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/exec@1.0.8/packages/exec#readme

