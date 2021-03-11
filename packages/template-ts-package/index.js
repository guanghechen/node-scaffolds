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

      const resolveSourcePath = p =>
        path.normalize(path.resolve(__dirname, 'boilerplate', p))
      const resolveTargetPath = p =>
        path.normalize(path.resolve(answers.packageLocation, p))
      const relativePath = path.relative(answers.packageLocation, cwd)

      answers.tsconfigExtends = answers.isMonorepo
        ? path.join(relativePath, 'tsconfig')
        : './tsconfig.settings'
      answers.tsconfigSrcExtends = answers.isMonorepo
        ? path.join(relativePath, 'tsconfig.settings')
        : './tsconfig.settings'
      answers.nodeModulesPath = path.join(relativePath, 'node_modules')
      answers.toolPackageVersion = manifest.version

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
        {
          type: 'add',
          path: resolveTargetPath('rollup.config.js'),
          templateFile: resolveSourcePath('rollup.config.js.hbs'),
        },
        !answers.isMonorepo && {
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
