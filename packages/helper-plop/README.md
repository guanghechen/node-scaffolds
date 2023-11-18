<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/helper-plop@6.0.0-alpha.0/packages/helper-plop#readme">@guanghechen/helper-plop</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/helper-plop">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/helper-plop.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-plop">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/helper-plop.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/helper-plop">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/helper-plop.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/helper-plop"
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


A collection of utility functions for plop templates.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/helper-plop
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/helper-plop
  ```

## Usage

This package exposed some [inquirer][] question and answer resolver.

### Npm package

* `NpmPackagePreAnswers`:

  Name                  | Type      | Description
  :--------------------:|:---------:|:-----------------:
  `cwd`                 | `string`  | Current workspace directory
  `isMonorepo`          | `boolean` | Whether if this package under a monorepo

* `NpmPackagePromptsAnswers`:

  Name                  | Type      | Description
  :--------------------:|:---------:|:-----------------:
  `packageName`         | `string`  | Npm package name
  `packageAuthor`       | `string`  | Package author
  `packageVersion`      | `string`  | Package version
  `packageDescription`  | `string`  | Package description
  `packageLocation`     | `string`  | Package location (path relative to the current directory)

* `NpmPackageData`:

  Extended `NpmPackagePreAnswers` and `NpmPackagePromptsAnswers` With following
  Additional properties.

  Name                  | Type      | Description
  :--------------------:|:---------:|:-----------------:
  `packageUsage`        | `string`  | Package usage
  `repositoryName`      | `string`  | Git repository name
  `repositoryHomepage`  | `string`  | Git repository homepage

### Example

I recommend you use the following template directory structure:

```
├── boilerplate/
│   ├── package.json.hbs
│   ├── README.md.hbs
│   ├── rollup.config.js.hbs
│   ├── src
│   │   └── index.ts.hbs
│   ├── tsconfig.json.hbs
│   ├── tsconfig.settings.json.hbs
│   └── tsconfig.src.json.hbs
├── node_modules/
├── cli.js
├── index.js
├── package.json
└── README.md
```

Where the `index.js` exposed a default plop config, such as:

  ```javascript
  const {
    createNpmPackagePrompts,
    resolveNpmPackageAnswers,
    resolveNpmPackagePreAnswers,
  } = require('@guanghechen/helper-plop')
  const path = require('path')
  const manifest = require('./package.json')

  module.exports = function (plop) {
    const preAnswers = resolveNpmPackagePreAnswers()
    const defaultAnswers = { packageVersion: manifest.version }
    const { cwd, isMonorepo } = preAnswers

    plop.setGenerator('ts-package', {
      description: 'create template typescript project',
      prompts: [...createNpmPackagePrompts(preAnswers, defaultAnswers)],
      actions: function (_answers) {
        const answers = resolveNpmPackageAnswers(preAnswers, _answers)
        answers.toolPackageVersion = manifest.version

        const resolveSourcePath = p =>
          path.normalize(path.resolve(__dirname, 'boilerplate', p))
        const resolveTargetPath = p =>
          path.normalize(path.resolve(answers.packageLocation, p))
        const relativePath = path.relative(answers.packageLocation, cwd)

        // Assign resolved data into plop templates.
        Object.assign(_answers, answers)

        return [
          {
            type: 'add',
            path: resolveTargetPath('package.json'),
            templateFile: resolveSourcePath('package.json.hbs'),
          },
          {
            type: 'add',
            path: resolveTargetPath('README.md'),
            templateFile: resolveSourcePath('README.md.hbs'),
          },
          !isMonorepo && {
            type: 'add',
            path: resolveTargetPath('rollup.config.js'),
            templateFile: resolveSourcePath('rollup.config.js.hbs'),
          },
        ].filter(Boolean)
      },
    })
  }
  ```

And the `cli.js` exposed a Node.js CLI script, such as:

  ```javascript
  #! /usr/bin/env node

  const { launch } = require('@guanghechen/helper-plop')
  const path = require('path')

  launch(
    process.argv,
    args => ({
      configPath: args.plopfile || path.join(__dirname, 'index.js'),
    })
  )
  ```
## Related

* [@yozora/template-tokenizer][]
* [inquirer][]


[@yozora/template-tokenizer]: https://github.com/yozorajs/yozora/blob/main/scaffolds/template-tokenizer
[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/helper-plop@6.0.0-alpha.0/packages/helper-plop#readme
[inquirer]: https://github.com/SBoudrias/Inquirer.js/
