<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/fs@1.0.10/packages/fs#readme">@guanghechen/fs</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/fs">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/fs.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/fs">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/fs.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/fs">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/fs.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/fs"
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

Provides enhanced methods based on `node:fs`.

## Install

* npm

  ```bash
  npm install --save @guanghechen/fs
  ```

* yarn

  ```bash
  yarn add @guanghechen/fs
  ```

## Usage

This package provides enhanced filesystem utilities that extend Node.js built-in `fs` module with additional safety, convenience, and logging features.

### File Collection

```typescript
import { collectAllFiles, collectAllFilesSync } from '@guanghechen/fs'

// Collect all JavaScript files
const jsFiles = await collectAllFiles('./src', (filepath, stat) => {
  return filepath.endsWith('.js') && stat.isFile()
})

// Synchronous version
const tsFiles = collectAllFilesSync('./src', (filepath) => {
  return filepath.endsWith('.ts')
})

// Collect all files (no filter)
const allFiles = await collectAllFiles('./project')
```

### Directory Management

```typescript
import { emptyDir, mkdirsIfNotExists, rm } from '@guanghechen/fs'

// Empty a directory (create if not exists)
await emptyDir('./temp', true, logger)

// Create directory structure if needed
mkdirsIfNotExists('./deep/nested/path/file.txt', false, logger)
mkdirsIfNotExists('./deep/nested/directory', true, logger)

// Remove files or directories recursively
await rm('./unwanted-folder')
await rm('./unwanted-file.txt')
```

### Safe File Writing

```typescript
import { writeFile } from '@guanghechen/fs'

// Write file with automatic directory creation
await writeFile('./output/data/results.json', JSON.stringify(data))

// Write with options
await writeFile('./output/text.txt', 'Hello World', { encoding: 'utf8' })
```

### File System Checks

```typescript
import { isFileSync, isDirectorySync, isNonExistentOrEmpty } from '@guanghechen/fs'

// Check if path is a file
if (isFileSync('./package.json')) {
  console.log('package.json exists and is a file')
}

// Check if path is a directory
if (isDirectorySync('./src')) {
  console.log('src directory exists')
}

// Check if directory is empty or doesn't exist
if (isNonExistentOrEmpty('./temp')) {
  console.log('temp directory is empty or does not exist')
}
```

### Critical Path Validation

```typescript
import { ensureCriticalFilepathExistsSync } from '@guanghechen/fs'

try {
  // Throws error if file doesn't exist or isn't a file
  ensureCriticalFilepathExistsSync('./config.json')
  console.log('Config file is valid')
} catch (error) {
  console.error('Critical file validation failed:', error.message)
}
```

### Bulk File Removal

```typescript
import { unlinksSync } from '@guanghechen/fs'

// Remove multiple files safely
unlinksSync(
  './temp1.txt',
  './temp2.txt',
  null, // Ignored safely
  ['./batch1.txt', './batch2.txt']
)
```

## API Reference

| Name | Signature | Description | Async |
|------|-----------|-------------|-------|
| `collectAllFiles` | `(dir: string, predicate?) => Promise<string[]>` | Collects all files under directory with optional filtering | ✓ |
| `collectAllFilesSync` | `(dir: string, predicate?) => string[]` | Synchronous version of collectAllFiles | ✗ |
| `emptyDir` | `(dirpath: string, createIfNotExist?, reporter?) => Promise<void>` | Removes all contents from directory, optionally creating it | ✓ |
| `ensureCriticalFilepathExistsSync` | `(filepath: string \| null) => void \| never` | Validates that a critical file exists and is actually a file | ✗ |
| `isDirectorySync` | `(dirpath: string \| null) => boolean` | Checks if path is an existing directory | ✗ |
| `isFileSync` | `(filepath: string \| null) => boolean` | Checks if path is an existing file | ✗ |
| `isNonExistentOrEmpty` | `(dirpath: string \| null) => boolean` | Checks if directory doesn't exist or is empty | ✗ |
| `mkdirsIfNotExists` | `(filepath: string, isDir: boolean, reporter?) => void` | Creates directory structure if it doesn't exist | ✗ |
| `rm` | `(fileOrDirPath: string) => Promise<void>` | Removes file or directory recursively | ✓ |
| `unlinksSync` | `(...filepaths: Array<string \| null \| undefined \| string[]>) => void` | Safely removes multiple files, ignoring null/undefined values | ✗ |
| `writeFile` | `(filepath: string, content: string \| NodeJS.ArrayBufferView, options?) => Promise<void>` | Writes file with automatic parent directory creation | ✓ |

### Detailed Interfaces

#### `collectAllFiles` Parameters

```typescript
function collectAllFiles(
  dir: string,
  predicate?: (filepath: string, stat: Stats) => Promise<boolean> | boolean
): Promise<string[]>
```

#### `emptyDir` Parameters

```typescript
function emptyDir(
  dirpath: string,
  createIfNotExist: boolean = true,
  reporter?: IReporter
): Promise<void>
```

#### `writeFile` Parameters

```typescript
function writeFile(
  filepath: string,
  content: string | NodeJS.ArrayBufferView,
  options?: WriteFileOptions
): Promise<void>
```

## Advanced Examples

### Build Tool Integration

```typescript
import { collectAllFiles, emptyDir, writeFile } from '@guanghechen/fs'

async function buildProject() {
  // Clean output directory
  await emptyDir('./dist')
  
  // Collect source files
  const sourceFiles = await collectAllFiles('./src', (filepath) => {
    return filepath.endsWith('.ts') && !filepath.includes('.test.')
  })
  
  // Process and write output files
  for (const sourceFile of sourceFiles) {
    const outputPath = sourceFile.replace('./src/', './dist/').replace('.ts', '.js')
    const compiledContent = await compileTypeScript(sourceFile)
    await writeFile(outputPath, compiledContent)
  }
}
```

### Project Scaffolding

```typescript
import { writeFile, mkdirsIfNotExists, isDirectorySync } from '@guanghechen/fs'

async function scaffoldProject(projectName: string) {
  const projectDir = `./${projectName}`
  
  // Create project structure
  mkdirsIfNotExists(`${projectDir}/src`, true)
  mkdirsIfNotExists(`${projectDir}/tests`, true)
  mkdirsIfNotExists(`${projectDir}/docs`, true)
  
  // Create initial files
  await writeFile(`${projectDir}/package.json`, JSON.stringify({
    name: projectName,
    version: '1.0.0',
    main: 'dist/index.js'
  }, null, 2))
  
  await writeFile(`${projectDir}/src/index.ts`, 'export default "Hello World"')
  await writeFile(`${projectDir}/README.md`, `# ${projectName}\n\nA new project.`)
}
```

### Cleanup Operations

```typescript
import { collectAllFiles, unlinksSync, rm } from '@guanghechen/fs'

async function cleanupProject() {
  // Remove all build artifacts
  await rm('./dist')
  await rm('./lib')
  await rm('./coverage')
  
  // Remove temporary files
  const tempFiles = await collectAllFiles('.', (filepath) => {
    return filepath.endsWith('.tmp') || filepath.endsWith('.cache')
  })
  
  unlinksSync(...tempFiles)
  
  // Remove specific log files
  unlinksSync('./debug.log', './error.log', './temp.txt')
}
```


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/fs@1.0.10/packages/fs#readme
