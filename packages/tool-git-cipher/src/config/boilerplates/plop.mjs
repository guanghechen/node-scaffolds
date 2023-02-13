import path from 'node:path'
import url from 'node:url'

export default function (plop) {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
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
          path: resolveTargetPath(answers.configFilepath),
          templateFile: resolveSourcePath('.ghc-config.json.hbs'),
        },
        // {
        //   type: 'add',
        //   path: resolveTargetPath(answers.secretFilepath),
        //   templateFile: resolveSourcePath('.ghc-secret.json.hbs'),
        // },
        {
          type: 'add',
          path: resolveTargetPath('.gitignore'),
          templateFile: resolveSourcePath('.gitignore.hbs'),
        },
      ]
    },
  })
}
