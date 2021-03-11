[![npm version](https://img.shields.io/npm/v/@guanghechen/plop-helper.svg)](https://www.npmjs.com/package/@guanghechen/plop-helper)
[![npm download](https://img.shields.io/npm/dm/@guanghechen/plop-helper.svg)](https://www.npmjs.com/package/@guanghechen/plop-helper)
[![npm license](https://img.shields.io/npm/l/@guanghechen/plop-helper.svg)](https://www.npmjs.com/package/@guanghechen/plop-helper)
[![Node Version](https://img.shields.io/node/v/@guanghechen/plop-helper)](https://github.com/nodejs/node)
[![Code Style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


# `@guanghechen/plop-helper`

A collection of utility functions for plop templates.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/plop-helper
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/plop-helper
  ```

## Usage

This package exposed some [inquirer][] question and answer resolver.

### Npm package

* `NpmPackagePromptsAnswers`

  Name                  | Type      | Description
  :--------------------:|:---------:|:-----------------:
  `packageName`         | `string`  | Npm package name
  `packageAuthor`       | `string`  | Package author
  `packageVersion`      | `string`  | Package version
  `packageDescription`  | `string`  | Package description
  `packageUsage`        | `string`  | Package usage
  `packageLocation`     | `string`  | Package location (path relative to the current directory)
  `repositoryName`      | `string`  | Git repository name
  `repositoryHomepage`  | `string`  | Git repository homepage
  `isMonorepo`          | `boolean` | Whether if this package under a monorepo

### Example

I recommend you use the following template directory structure:

```
├── boilerplate
│   ├── package.json.hbs
│   ├── README.md.hbs
│   ├── rollup.config.js.hbs
│   ├── src
│   │   └── index.ts.hbs
│   ├── tsconfig.json.hbs
│   ├── tsconfig.settings.json.hbs
│   └── tsconfig.src.json.hbs
├── cli.js
├── index.js
├── node_modules
├── package.json
└── README.md
```

Where the `index.js` exposed a default plop config, such as:

  ```javascript
  const {
    resolveNpmPackageAnswers,
    createNpmPackagePrompts,
  } = require('@guanghechen/plop-helper')
  const path = require('path')
  const manifest = require('./package.json')

  module.exports = function (plop) {
  const cwd = path.resolve(process.cwd())
  plop.setGenerator('ts-package', {
    description: 'create template typescript project',
    prompts: [
      ...createNpmPackagePrompts(cwd, {
        packageVersion: manifest.version,
      }),
    ],
    actions: function (_answers) {
      const answers = resolveNpmPackageAnswers(_answers)
      answers.toolPackageVersion = manifest.version

      // Assign resolved data into plop templates.
      Object.assign(_answers, answers)

      const resolveSourcePath = p =>
        path.normalize(path.resolve(__dirname, 'boilerplate', p))
      const resolveTargetPath = p =>
        path.normalize(path.resolve(answers.packageLocation, p))
      const relativePath = path.relative(answers.packageLocation, cwd)

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
        !answers.isMonorepo && {
          type: 'add',
          path: resolveTargetPath('rollup.config.js'),
          templateFile: resolveSourcePath('rollup.config.js.hbs'),
        },
      ]
  }
  ```

And the `cli.js` exposed a Node.js CLI script, such as:

  ```javascript
  #! /usr/bin/env node

  const { launch } = require('@guanghechen/plop-helper')
  const path = require('path')

  launch(
    process.argv,
    args => ({
      configPath: args.plopfile || path.join(__dirname, 'index.js'),
    })
  )
  ```
## Related

* [@guanghechen/template-ts-package][]
* [inquirer][]


[inquirer]: https://github.com/SBoudrias/Inquirer.js/
[@guanghechen/template-ts-package]: https://github.com/guanghechen/node-scaffolds/tree/master/packages/template-ts-package#readme
