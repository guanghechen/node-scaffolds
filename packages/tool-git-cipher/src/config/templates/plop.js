/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = function (plop) {
  plop.setGenerator('cipher-repository', {
    description: 'create ciphertext files repository',
    prompts: [],
    actions: function (answers) {
      const workspace = answers.workspace || path.resolve()
      const resolveSourcePath = p => path.normalize(path.resolve(__dirname, p))
      const resolveTargetPath = p => path.normalize(path.resolve(workspace, p))

      return [
        {
          type: 'add',
          path: resolveTargetPath('.vscode/settings.json'),
          templateFile: resolveSourcePath('.vscode/settings.json.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.gitignore'),
          templateFile: resolveSourcePath('.gitignore.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('package.json'),
          templateFile: resolveSourcePath('package.json.hbs'),
        },
      ]
    },
  })
}
