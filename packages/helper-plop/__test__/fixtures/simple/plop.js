const {
  createNpmPackagePrompts,
  resolveNpmPackageAnswers,
  resolveNpmPackagePreAnswers,
} = require('@guanghechen/helper-plop')
const path = require('path')

const manifest = {
  version: '1.0.0-alpha',
}

module.exports = function (plop) {
  const preAnswers = resolveNpmPackagePreAnswers()
  const defaultAnswers = { packageVersion: manifest.version }

  plop.setGenerator('ts-package', {
    description: 'create template typescript project',
    prompts: [...createNpmPackagePrompts(preAnswers, defaultAnswers)],
    actions: function (_answers) {
      const answers = resolveNpmPackageAnswers(preAnswers, _answers)
      answers.toolPackageVersion = manifest.version

      const resolveSourcePath = p =>
        path.normalize(path.resolve(__dirname, p))
      const resolveTargetPath = p =>
        path.normalize(path.resolve(answers.packageLocation, p))

      // Assign resolved data into plop templates.
      Object.assign(_answers, answers)

      // promptsAnswers:
      console.debug(_answers)
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
        {
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
