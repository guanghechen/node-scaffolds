<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/eslint-config@7.0.20/packages/eslint-config#readme">@guanghechen/eslint-config</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/eslint-config">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/eslint-config.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/eslint-config">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/eslint-config.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/eslint-config">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/eslint-config.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/eslint-config"
      />
    </a>
    <a href="https://github.com/eslint/eslint">
      <img
        alt="ESLint Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/eslint-config/peer/eslint"
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


Preset eslint configs for node.js/javascript/react/typescript project.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/eslint-config
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/eslint-config
  ```

## Usage

This package provides comprehensive ESLint configurations for modern JavaScript/TypeScript projects with support for React, Jest, and accessibility rules.

### Basic Configuration

```javascript
// eslint.config.js
import configs from '@guanghechen/eslint-config'

export default configs
```

### Custom TypeScript Configuration

```javascript
// eslint.config.js
import { genConfigs } from '@guanghechen/eslint-config'

export default genConfigs({
  tsconfigPath: './custom-tsconfig.json'
})
```

### Extend with Additional Rules

```javascript
// eslint.config.js
import configs from '@guanghechen/eslint-config'

export default [
  ...configs,
  {
    files: ['src/**/*.ts'],
    rules: {
      // Additional custom rules
      'no-console': 'error'
    }
  }
]
```

## Features

### Comprehensive Language Support

- **JavaScript** (ES2018+) - CommonJS and ES Modules
- **TypeScript** - Strict type checking with modern TS features
- **React/JSX** - Component development with accessibility rules
- **Jest** - Testing environment configuration

### Built-in Plugins

- **@eslint/js** - Core ESLint recommended rules
- **typescript-eslint** - TypeScript-specific linting
- **eslint-plugin-react** - React component best practices
- **eslint-plugin-jsx-a11y** - Accessibility rules for JSX
- **eslint-plugin-import** - Import/export validation
- **eslint-plugin-jest** - Jest testing rules
- **@stylistic/eslint-plugin** - Code formatting rules
- **eslint-plugin-prettier** - Prettier integration

### File Type Detection

The config automatically applies appropriate rules based on file extensions:

- **`.js`, `.cjs`** - CommonJS JavaScript files
- **`.mjs`, `.ts`, `.mts`** - ES Module JavaScript/TypeScript files
- **`.jsx`, `.tsx`** - React component files with JSX support
- **Test files** - Special rules for `__test__/**` directories

## Configuration Details

### TypeScript Rules

Enhanced TypeScript configuration includes:

```typescript
// Enforced conventions
'@typescript-eslint/consistent-type-imports': 'error'        // Use type imports
'@typescript-eslint/explicit-function-return-type': 'error'  // Explicit return types
'@typescript-eslint/no-floating-promises': 'error'          // Handle promises properly
'@typescript-eslint/array-type': 'error'                    // Consistent array syntax
'@typescript-eslint/consistent-type-definitions': 'interface' // Prefer interfaces
```

### React/JSX Rules

React development with accessibility focus:

```typescript
// JSX formatting and accessibility
'react/jsx-boolean-value': ['error', 'always']              // Explicit boolean props
'react/jsx-curly-spacing': ['error', { when: 'always' }]    // Consistent spacing
'jsx-a11y/alt-text': 'warn'                                 // Image alt text
'jsx-a11y/aria-props': 'warn'                               // Valid ARIA properties
```

### Import Management

Organized import statements:

```typescript
'import/order': [
  'error',
  {
    alphabetize: { order: 'asc', caseInsensitive: true },
    groups: [['builtin', 'external'], 'internal', 'parent', 'sibling'],
    'newlines-between': 'never'
  }
]
```

### Code Style

Consistent formatting preferences:

```typescript
// Style preferences
semi: ['error', 'never']                    // No semicolons
quotes: ['error', 'single', { avoidEscape: true }]  // Single quotes
'max-len': ['error', { code: 100 }]          // 100 character limit
'spaced-comment': ['error', 'always']        // Space after comment markers
```

## Ignored Patterns

The configuration automatically ignores common build and development directories:

- `node_modules/`
- `dist/`, `lib/`
- `coverage/`
- `__test__/fixtures/`
- `.nx/`, `.yarn/`, `.git/`
- `**/*.hbs` (Handlebars templates)

## Special File Configurations

### Test Files

Test files in `__test__/**` directories get relaxed rules:

```typescript
{
  files: ['**/__test__/**/*.{js,ts,jsx,tsx}'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'import/no-extraneous-dependencies': 'off'
  }
}
```

### Constants Files

Constant definition files have relaxed enum rules:

```typescript
{
  files: ['**/constant.{ts,cts,mts}', '**/constant/**.{ts,cts,mts}'],
  rules: {
    '@typescript-eslint/prefer-literal-enum-member': 'off'
  }
}
```

### Configuration Files

Build and config files allow anonymous default exports:

```typescript
{
  files: [
    'eslint.config.{js,mjs}',
    'jest.config.{js,mjs}',
    'rollup.config.{js,ts}'
  ],
  rules: {
    'import/no-anonymous-default-export': 'off'
  }
}
```

## Global Variables

The configuration includes predefined globals for different environments:

- **Node.js** - `global`, `process`, `Buffer`, etc.
- **Browser** - `window`, `document`, `console`, etc.
- **Jest** - `describe`, `it`, `expect`, `beforeEach`, etc.

## API Reference

| Name | Signature | Description |
|------|-----------|-------------|
| `genConfigs` | `(params?: { tsconfigPath?: string }) => Array<ESLintConfig>` | Generates ESLint configuration array with optional parameters |
| Default Export | Array\<ESLintConfig\> | Pre-configured ESLint config array using default settings |

### Detailed Parameters

#### `genConfigs` Parameters

- `tsconfigPath?: string` - Path to TypeScript configuration file (default: './tsconfig.json')

**Returns:** `Array<ESLintConfig>`

### Usage Examples

#### Default Export

Pre-configured ESLint config array using default settings.

```javascript
import configs from '@guanghechen/eslint-config'
// Equivalent to: genConfigs({ tsconfigPath: './tsconfig.json' })
```

## Integration Examples

### With VS Code

```json
{
  "eslint.experimental.useFlatConfig": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### With Package Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### With Husky Pre-commit

```bash
#!/usr/bin/env sh
npx lint-staged
```

```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "git add"]
  }
}
```

[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/eslint-config@7.0.20/packages/eslint-config#readme
[@guanghechen/eslint-config]: https://www.npmjs.com/package/@guanghechen/eslint-config
