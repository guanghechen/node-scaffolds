import {
  createNpmPackagePrompts,
  resolveNpmPackageAnswers,
  resolveNpmPackagePreAnswers,
} from '@guanghechen/helper-plop'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const manifest = {
  version: '1.0.0-alpha',
}

export default async function (plop) {
  const defaultAnswers = { packageVersion: manifest.version }
  const preAnswers = await resolveNpmPackagePreAnswers()
  const prompts = await createNpmPackagePrompts(preAnswers, defaultAnswers)

  plop.setGenerator('ts-package', {
    description: 'create template typescript project',
    prompts: [...prompts],
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
