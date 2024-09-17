import ghcConfigs from '@guanghechen/eslint-config'

export default [
  {
    ignores: [
      '.vscode/',
      '**/__tmp__/',
      '**/__test__/cases/',
      '**/__test__/fixtures/',
      '**/coverage/',
      '**/dist/',
      '**/doc/',
      '**/example/',
      '**/lib/',
      '**/node_modules/',
      '**/resources/',
      '**/test/',
    ],
  },
  ...ghcConfigs,
  {
    files: ['eslint.config.js'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
]
