<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/globby@1.0.6/packages/globby#readme">@guanghechen/globby</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/globby">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/globby.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/globby">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/globby.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/globby">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/globby.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/globby"
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

Enhanced glob pattern matching utility with gitignore support and directory expansion.

## Install

* npm

  ```bash
  npm install --save @guanghechen/globby
  ```

* yarn

  ```bash
  yarn add @guanghechen/globby
  ```

## Usage

This package provides an enhanced glob utility built on top of [fast-glob](https://github.com/mrmlnc/fast-glob) with additional features like gitignore support, directory expansion, and sophisticated ignore file handling.

### Basic Globbing

```typescript
import { globby, globbySync } from '@guanghechen/globby'

// Find all TypeScript files
const tsFiles = await globby(['src/**/*.ts'])
console.log('TypeScript files:', tsFiles)

// Synchronous version
const jsFiles = globbySync(['lib/**/*.js'])
console.log('JavaScript files:', jsFiles)

// Multiple patterns
const sourceFiles = await globby([
  'src/**/*.{ts,tsx}',
  'lib/**/*.js',
  '!**/*.test.*'
])
```

### Directory Expansion

```typescript
import { globby } from '@guanghechen/globby'

// Automatically expand directories
const files = await globby(['src', 'lib'], {
  expandDirectories: {
    files: ['index'],
    extensions: ['ts', 'js']
  }
})
// Finds: src/index.ts, src/index.js, lib/index.ts, lib/index.js

// Simple directory expansion
const allFiles = await globby(['src'], {
  expandDirectories: true
})
// Finds all files under src/
```

### Gitignore Support

```typescript
import { globby } from '@guanghechen/globby'

// Respect .gitignore files
const files = await globby(['**/*'], {
  gitignore: true
})

// Custom ignore files
const files2 = await globby(['**/*'], {
  ignoreFiles: ['.customignore', '.buildignore']
})

// Both gitignore and custom ignore files
const files3 = await globby(['**/*'], {
  gitignore: true,
  ignoreFiles: ['.dockerignore']
})
```

### Advanced Pattern Matching

```typescript
import { globby } from '@guanghechen/globby'

// Complex pattern matching
const files = await globby([
  'src/**/*.ts',           // Include TypeScript files
  '!src/**/*.test.ts',     // Exclude test files
  '!src/**/*.spec.ts',     // Exclude spec files
  'docs/**/*.md'           // Include documentation
], {
  cwd: '/project/root',
  absolute: true,
  onlyFiles: true
})
```

### Ignore File Utilities

```typescript
import { 
  isGitIgnored, 
  isGitIgnoredSync,
  isIgnoredByIgnoreFiles,
  isIgnoredByIgnoreFilesSync 
} from '@guanghechen/globby'

// Check if files are git-ignored
const isIgnored = await isGitIgnored({ cwd: './project' })
console.log('Is ignored:', isIgnored('./temp-file.txt'))

// Check against custom ignore files
const customIgnored = await isIgnoredByIgnoreFiles(['.dockerignore'], {
  cwd: './project'
})
console.log('Is docker-ignored:', customIgnored('./Dockerfile.dev'))

// Synchronous versions
const isGitIgnoredFn = isGitIgnoredSync({ cwd: './project' })
const isCustomIgnoredFn = isIgnoredByIgnoreFilesSync(['.eslintignore'], {
  cwd: './project'
})
```

## API Reference

| Name | Signature | Description |
|------|-----------|-------------|
| `globby` | `(patterns: string[], options?: Options) => Promise<string[]>` | Asynchronously finds files matching the given glob patterns |
| `globbySync` | `(patterns: string[], options?: Options) => string[]` | Synchronously finds files matching the given glob patterns |
| `isGitIgnored` | `(options?: IgnoreOptions) => Promise<IFilepathPredicate>` | Creates a predicate function to check if files are ignored by .gitignore |
| `isGitIgnoredSync` | `(options?: IgnoreOptions) => IFilepathPredicate` | Synchronous version of isGitIgnored |
| `isIgnoredByIgnoreFiles` | `(patterns: string[], options?) => Promise<IFilepathPredicate>` | Creates a predicate function to check if files are ignored by custom ignore files |
| `isIgnoredByIgnoreFilesSync` | `(patterns: string[], options?) => IFilepathPredicate` | Synchronous version of isIgnoredByIgnoreFiles |

### Detailed Interfaces

#### `Options` Interface

```typescript
interface Options {
  cwd?: string                                      // Current working directory
  expandDirectories?: ExpandDirectoriesOption       // Expand directories to glob patterns
  gitignore?: boolean                              // Respect .gitignore files
  ignoreFiles?: string | string[]                 // Custom ignore files to respect
  ignore?: string[]                               // Additional patterns to ignore
  absolute?: boolean                              // Return absolute paths
  onlyFiles?: boolean                             // Match only files (not directories)
  onlyDirectories?: boolean                       // Match only directories (not files)
  followSymbolicLinks?: boolean                   // Follow symbolic links
  suppressErrors?: boolean                        // Throw errors instead of ignoring them
  deep?: number                                   // Maximum search depth
  // Additional fast-glob options...
}
```

#### `ExpandDirectoriesOption` Type

```typescript
type ExpandDirectoriesOption = 
  | boolean 
  | string[] 
  | { 
      files?: string[]       // Specific filenames to match
      extensions?: string[]  // File extensions to match
    }
```

#### `IFilepathPredicate` Type

```typescript
type IFilepathPredicate = (filepath: string) => boolean
```

#### `IIgnoreOptions` Interface

```typescript
interface IIgnoreOptions {
  cwd?: string                    // Current working directory
  suppressErrors?: boolean        // Suppress errors during processing
  deep?: number                  // Maximum search depth
  ignore?: string[]             // Additional ignore patterns
}
```

## Features

### Directory Expansion

Automatically converts directory paths to appropriate glob patterns:

```typescript
// Input: ['src']
// With expandDirectories: true
// Becomes: ['src/**/*']

// With expandDirectories: { extensions: ['ts', 'js'] }
// Becomes: ['src/**/*.{ts,js}']

// With expandDirectories: { files: ['index'], extensions: ['ts'] }
// Becomes: ['src/**/index.ts']
```

### Gitignore Integration

- Automatically reads and respects `.gitignore` files
- Supports nested `.gitignore` files in subdirectories
- Properly handles relative paths and patterns
- Compatible with standard gitignore syntax

### Smart Ignore Handling

- Default ignores: `node_modules`, `flow-typed`, `coverage`, `.git`
- Supports multiple ignore file formats
- Handles both positive and negative patterns
- Efficient caching of ignore predicates

### Pattern Processing

- Negative pattern support (patterns starting with `!`)
- Automatic deduplication of results
- Path normalization across platforms
- Efficient batch processing of multiple patterns

## Examples

### Build Tool Integration

```typescript
import { globby } from '@guanghechen/globby'

async function buildProject() {
  // Find all source files excluding tests
  const sourceFiles = await globby([
    'src/**/*.{ts,tsx}',
    '!src/**/*.{test,spec}.{ts,tsx}'
  ], {
    gitignore: true
  })
  
  // Process each file
  for (const file of sourceFiles) {
    await processFile(file)
  }
}
```

### Linting Setup

```typescript
import { globby } from '@guanghechen/globby'

async function lintProject() {
  const files = await globby([
    '**/*.{js,ts,jsx,tsx}',
    '!node_modules/**',
    '!dist/**'
  ], {
    gitignore: true,
    ignoreFiles: ['.eslintignore']
  })
  
  return runLinter(files)
}
```

### Documentation Generation

```typescript
import { globby } from '@guanghechen/globby'

async function generateDocs() {
  const apiFiles = await globby(['src/api'], {
    expandDirectories: {
      extensions: ['ts'],
      files: ['index', 'types']
    }
  })
  
  const docFiles = await globby(['docs/**/*.md'])
  
  return generateDocumentation([...apiFiles, ...docFiles])
}
```

### Deployment Preparation

```typescript
import { globby, isGitIgnored } from '@guanghechen/globby'

async function prepareDeployment() {
  // Get all files not ignored by git
  const allFiles = await globby(['**/*'], {
    gitignore: true,
    onlyFiles: true
  })
  
  // Additional deployment-specific filtering
  const deployFiles = await globby(allFiles.filter(file => 
    !file.includes('.test.') && 
    !file.startsWith('docs/')
  ))
  
  return deployFiles
}
```

## Related

- [fast-glob](https://github.com/mrmlnc/fast-glob) - The underlying glob implementation
- [ignore](https://github.com/kaelzhang/node-ignore) - Gitignore pattern matching

[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/globby@1.0.6/packages/globby#readme