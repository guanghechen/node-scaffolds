const fs = require('fs')
const path = require('path')
const semverRegex = require('semver-regex')
const manifest = require('./package.json')

module.exports = function (plop) {
  const cwd = path.resolve(process.cwd())
  plop.setGenerator('ts-package', {
    description: 'create template typescript project',
    prompts: [
      {
        type: 'input',
        name: 'packageName',
        message: 'name',
        transform: text => text.trim(),
      },
      {
        type: 'input',
        name: 'packageAuthor',
        message: 'author',
        default: () => {
          // detect package.json
          const packageJsonPath = path.resolve(cwd, 'package.json')
          if (fs.existsSync(packageJsonPath)) {
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8')
            const packageJson = JSON.parse(packageJsonContent)
            if (packageJson.author == null) return undefined
            if (typeof packageJson.author === 'string')
              return packageJson.author
            if (typeof packageJson.author.name === 'string')
              return packageJson.author.name
          }
          return undefined
        },
        transform: text => text.trim(),
      },
      {
        type: 'input',
        name: 'packageVersion',
        message: 'version',
        default: manifest.version,
        transform: text => text.trim(),
        validate: text => semverRegex().test(text),
      },
      {
        type: 'input',
        name: 'packageLocation',
        message: ({ packageName }) => 'location of ' + packageName,
        default: answers => {
          // detect lerna
          if (fs.existsSync(path.resolve(cwd, 'lerna.json'))) {
            // eslint-disable-next-line no-param-reassign
            answers.isLernaProject = true
            // eslint-disable-next-line no-param-reassign
            answers.projectName = answers.packageName.startsWith('@')
              ? /^@([^\\/]+)/.exec(answers.packageName)[1]
              : /^([^-]+)/.exec(answers.packageName)[1]
            return (
              'packages/' + answers.packageName.replace(/^[^\\/]+[\\/]/, '')
            )
          }
          // eslint-disable-next-line no-param-reassign
          answers.projectName = answers.packageName
            .replace(/^@/, '')
            .replace('\\/', '-')
          return answers.packageName.replace(/^@/, '')
        },
        transform: text => text.trim(),
      },
    ],
    actions: function (answers) {
      const resolveSourcePath = p =>
        path.normalize(path.resolve(__dirname, 'boilerplate', p))
      const resolveTargetPath = p =>
        path.normalize(path.resolve(answers.packageLocation, p))
      const relativePath = path.relative(answers.packageLocation, cwd)
      // eslint-disable-next-line no-param-reassign
      answers.tsconfigExtends = answers.isLernaProject
        ? path.join(relativePath, 'tsconfig')
        : './tsconfig.settings'
      // eslint-disable-next-line no-param-reassign
      answers.tsconfigSrcExtends = answers.isLernaProject
        ? path.join(relativePath, 'tsconfig.settings')
        : './tsconfig.settings'
      // eslint-disable-next-line no-param-reassign
      answers.nodeModulesPath = path.join(relativePath, 'node_modules')
      // eslint-disable-next-line no-param-reassign
      answers.toolPackageVersion = manifest.version

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
        !answers.isLernaProject && {
          type: 'add',
          path: resolveTargetPath('rollup.config.js'),
          templateFile: resolveSourcePath('rollup.config.js.hbs'),
        },
        !answers.isLernaProject && {
          type: 'add',
          path: resolveTargetPath('tsconfig.settings.json'),
          templateFile: resolveSourcePath('tsconfig.settings.json.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('tsconfig.json'),
          templateFile: resolveSourcePath('tsconfig.json.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('tsconfig.src.json'),
          templateFile: resolveSourcePath('tsconfig.src.json.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/index.ts'),
          templateFile: resolveSourcePath('src/index.ts.hbs'),
        },
      ].filter(Boolean)
    },
  })
}
