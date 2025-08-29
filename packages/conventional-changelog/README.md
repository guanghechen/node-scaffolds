<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/conventional-changelog@6.0.4/packages/conventional-changelog#readme">@guanghechen/conventional-changelog</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/conventional-changelog">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/conventional-changelog.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/conventional-changelog">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/conventional-changelog.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/conventional-changelog">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/conventional-changelog.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/conventional-changelog"
      />
    </a>
    <a href="https://github.com/eslint/eslint">
      <img
        alt="ESLint Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/conventional-changelog/peer/eslint"
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


A conventional changelog preset that supports gitmoji and follows semantic commit conventions.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/conventional-changelog
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/conventional-changelog
  ```

## Usage

This package provides a conventional-changelog preset configuration that supports gitmoji and follows semantic commit conventions for generating changelogs.

### Basic Usage with conventional-changelog

```bash
npx conventional-changelog -p @guanghechen/conventional-changelog -i CHANGELOG.md -s
```

### Using with semantic-release

```javascript
// release.config.js
module.exports = {
  plugins: [
    ['@semantic-release/commit-analyzer', {
      preset: '@guanghechen/conventional-changelog'
    }],
    ['@semantic-release/release-notes-generator', {
      preset: '@guanghechen/conventional-changelog'
    }],
    '@semantic-release/changelog',
    '@semantic-release/npm',
    '@semantic-release/github'
  ]
}
```

### Using with Lerna

```javascript
{
  "changelog": {
    "preset": "@guanghechen/conventional-changelog"
  },
  "command": {
    "publish": {
      "conventionalCommits": true
    },
    "version": {
      "conventionalCommits": true
    }
  }
}
```

### Programmatic Usage

```typescript
import conventionalChangelogPreset from '@guanghechen/conventional-changelog'

async function generateChangelog() {
  const preset = await conventionalChangelogPreset
  
  // Use with conventional-changelog-core
  const conventionalChangelog = require('conventional-changelog-core')
  
  conventionalChangelog({
    config: preset.conventionalChangelog
  })
  .pipe(process.stdout)
}
```

## Supported Commit Types

This preset recognizes and categorizes the following commit types:

### Features
- `feat` / `feature` - New features

### Bug Fixes  
- `fix` - Bug fixes

### Performance Improvements
- `perf` / `performance` / `improve` - Performance improvements

### Documentation
- `doc` / `docs` - Documentation changes

### Styles
- `style` - Code style changes (formatting, etc.)

### Code Refactoring
- `refactor` - Code refactoring

### Tests
- `test` - Test additions or modifications

### Build System
- `build` - Build system changes

### Continuous Integration
- `ci` - CI configuration changes

### Reverts
- `revert` - Commit reverts

## Gitmoji Support

This preset includes full support for [gitmoji](https://gitmoji.dev/) in commit messages:

```
✨ feat(api): add user authentication endpoint
🐛 fix(auth): resolve token validation issue
📝 docs: update API documentation
🎨 style: improve code formatting
♻️  refactor: extract utility functions
✅ test: add integration tests for login
```

The gitmoji codes (e.g., `:sparkles:`) are automatically converted to emoji in the generated changelog.

## Commit Message Format

```
[gitmoji] type(scope): description

[optional body]

[optional footer(s)]
```

### Examples

```
✨ feat(auth): add OAuth2 integration
🐛 fix(api): handle edge case in user validation  
📝 docs(readme): update installation instructions
🎨 style: format code according to prettier
♻️  refactor(utils): extract common functions
✅ test: add unit tests for auth module
```

## Breaking Changes

Breaking changes are identified by:
- `BREAKING CHANGE:` footer
- Commits with breaking change notes

Example:
```
✨ feat(api): redesign user endpoints

BREAKING CHANGE: User API endpoints have been restructured. 
Update your client code to use the new /v2/users endpoints.
```

## Versioning Recommendations

The preset provides semantic version bump recommendations based on commit types:

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features (`feat`)
- **Patch** (0.0.1): Bug fixes, docs, styles, refactoring, tests

## Configuration Reference

| Object | Signature | Description |
|--------|-----------|-------------|
| `parserOpts` | Object | Parser options for conventional-commits-parser |
| `recommendedBumpOpts` | Object | Options for determining semantic version bumps based on commits |
| `writerOpts` | Promise\<Object\> | Writer options for conventional-changelog-writer, including templates and transforms |

### Detailed Configuration Objects

#### `parserOpts` Object
Parser options for conventional-commits-parser:

```typescript
{
  headerPattern: /^\s*(?:(:\w+:)\s)?\s*(\w*)(?:\((.*)\))?: (.*)$/,
  headerCorrespondence: ['gitmoji', 'type', 'scope', 'subject'],
  issuePrefixes: ['#'],
  noteKeywords: ['BREAKING CHANGE'],
  referenceActions: ['close', 'closes', 'closed', 'fix', 'fixes', 'fixed', 'resolve', 'resolves', 'resolved'],
  revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
  revertCorrespondence: ['header', 'hash']
}
```

#### `recommendedBumpOpts` Object
Options for determining semantic version bumps based on commits.

#### `writerOpts` Promise
Writer options for conventional-changelog-writer, including:
- Handlebars templates for rendering
- Transform functions for processing commits
- Sorting and grouping options

## Template Customization

The preset uses Handlebars templates that can be found in the `boilerplates/` directory:

- `template.hbs` - Main changelog template
- `header.hbs` - Header partial
- `commit.hbs` - Individual commit template  
- `footer.hbs` - Footer partial

## Integration Examples

### With Release-It

```json
{
  "git": {
    "commitMessage": "🔖 release: ${version}",
    "tagName": "v${version}"
  },
  "plugins": {
    "@release-it/conventional-changelog": {
      "preset": "@guanghechen/conventional-changelog",
      "infile": "CHANGELOG.md"
    }
  }
}
```

## Related

* [conventional-changelog][]


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/conventional-changelog@6.0.4/packages/conventional-changelog#readme
[@guanghechen/conventional-changelog]: https://www.npmjs.com/package/@guanghechen/conventional-changelog
[conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog
