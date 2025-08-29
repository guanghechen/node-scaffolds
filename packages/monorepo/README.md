<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/monorepo@1.0.5/packages/monorepo#readme">@guanghechen/monorepo</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/monorepo">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/monorepo.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/monorepo">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/monorepo.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/monorepo">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/monorepo.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/monorepo"
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

Utils for managing monorepo.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/monorepo
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/monorepo
  ```

## Usage

This package provides utilities for managing monorepo projects, including dependency analysis and project file generation for Nx workspace configurations.

### Dependency Analysis

```javascript
import { checkDepsInfo } from '@guanghechen/monorepo'

// Analyze dependencies across workspace packages
const depsInfo = await checkDepsInfo('/path/to/workspace', ['packages'])

console.log('External dependencies:', depsInfo.dependencies)
console.log('External dev dependencies:', depsInfo.devDependencies)
```

### Project Configuration Generation

```javascript
import { genProjects, genProjectJSON } from '@guanghechen/monorepo'

// Generate project.json files for all packages in workspaces
await genProjects('/path/to/workspace', ['packages', 'tools'])

// Generate individual project.json content
const projectConfig = genProjectJSON({
  workspaceName: 'packages',
  packageName: 'my-package',
  rollupConfigFilename: 'rollup.config.mjs',
  hasTests: true
})
```

## API Reference

| Name | Signature | Description |
|------|-----------|-------------|
| `checkDepsInfo` | `(workspaceRoot: string, workspaceNames: string[]) => Promise<IDepsInfo>` | Analyzes dependencies across all packages in specified workspaces |
| `genProjects` | `(workspaceRoot: string, workspaceNames: string[]) => Promise<void>` | Generates project.json files for all packages in specified workspaces |
| `genProjectJSON` | `(params: IGenProjectJSONParams) => string` | Generates the content for a single project.json file |

### Detailed Interfaces

#### `IDepsInfo` Interface

```typescript
interface IDepsInfo {
  dependencies: string[]      // External production dependencies with versions (name@version format)
  devDependencies: string[]   // External development dependencies with versions (name@version format)
}
```

#### `IGenProjectJSONParams` Interface

```typescript
interface IGenProjectJSONParams {
  workspaceName: string       // Workspace directory name (e.g., 'packages')
  packageName: string         // Package directory name
  rollupConfigFilename: string // Rollup config file to use for builds
  hasTests: boolean          // Whether package has tests (affects target generation)
}
```

## Project Configuration Structure

The generated `project.json` files include:

### Basic Structure
```json
{
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "name": "package-name",
  "sourceRoot": "packages/package-name/src",
  "projectType": "library",
  "tags": [],
  "targets": { ... }
}
```

### Build Targets

#### Clean Target
```json
{
  "clean": {
    "executor": "nx:run-commands",
    "options": {
      "cwd": "packages/package-name",
      "parallel": false,
      "commands": ["rimraf lib"]
    }
  }
}
```

#### Build Target
```json
{
  "build": {
    "executor": "nx:run-commands",
    "dependsOn": ["clean", "^build"],
    "options": {
      "cwd": "packages/package-name",
      "commands": ["rollup -c ../../rollup.config.mjs"],
      "env": {
        "NODE_ENV": "production",
        "ROLLUP_SHOULD_SOURCEMAP": "true"
      }
    },
    "configurations": {
      "production": {
        "env": {
          "ROLLUP_SHOULD_SOURCEMAP": "false"
        }
      }
    }
  }
}
```

#### Test Target (if tests exist)
```json
{
  "test": {
    "executor": "nx:run-commands",
    "options": {
      "commands": [
        "node --experimental-vm-modules ../../node_modules/.bin/jest --config ../../jest.config.mjs --rootDir ."
      ]
    },
    "configurations": {
      "coverage": { ... },
      "update": { ... }
    }
  }
}
```

## Use Cases

### Dependency Audit
```javascript
import { checkDepsInfo } from '@guanghechen/monorepo'

async function auditDependencies() {
  const depsInfo = await checkDepsInfo(process.cwd(), ['packages'])
  
  console.log('Production dependencies:')
  depsInfo.dependencies.forEach(dep => console.log(`  ${dep}`))
  
  console.log('Development dependencies:')
  depsInfo.devDependencies.forEach(dep => console.log(`  ${dep}`))
}
```

### Project Setup Automation
```javascript
import { genProjects } from '@guanghechen/monorepo'

async function setupWorkspace() {
  // Generate project.json for all packages
  await genProjects(process.cwd(), ['packages', 'tools'])
  console.log('Generated project.json files for all packages')
}
```

### Custom Project Configuration
```javascript
import { genProjectJSON } from '@guanghechen/monorepo'
import fs from 'node:fs'
import path from 'node:path'

function createCustomProject(packageName) {
  const config = genProjectJSON({
    workspaceName: 'packages',
    packageName,
    rollupConfigFilename: 'custom.rollup.config.mjs',
    hasTests: fs.existsSync(path.join('packages', packageName, '__test__'))
  })
  
  fs.writeFileSync(
    path.join('packages', packageName, 'project.json'),
    config
  )
}
```

## Integration with Nx

This package generates configurations compatible with [Nx](https://nx.dev/) build system:

```bash
# Build all packages
nx run-many --target=build

# Test packages with tests  
nx run-many --target=test

# Build specific package
nx build my-package

# Watch mode for development
nx watch my-package
```

## Integration with TypeScript

The dependency analysis relies on TypeScript path mappings in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@my-org/package-a": ["./packages/package-a/src"],
      "@my-org/package-b": ["./packages/package-b/src"]
    }
  }
}
```

Internal dependencies (those matching path mapping keys) are excluded from the external dependency analysis.

[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/monorepo@1.0.5/packages/monorepo#readme