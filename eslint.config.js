import ghcConfigs from '@guanghechen/eslint-config'

export default [
  {
    ignores: [
      '**/__tmp__/',
      '**/__test__/cases/',
      '**/doc/',
      '**/example/',
      '**/node_modules/',
      '**/resources/',
    ],
  },
  ...ghcConfigs,
  {
    files: [
      'eslint.config.js',
      'jest.config.mjs',
      'jest.helper.mts',
      'rollup.config.mjs',
      'rollup.config.cli.mjs',
      'playground/**/*.{js,mjs,ts,mts}',
    ],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
]
