// eslint-disable-next-line import/no-extraneous-dependencies
const { tsMonorepoConfig } = require('@guanghechen/jest-config')
const path = require('path')

const baseConfig = tsMonorepoConfig(__dirname, {
  useESM: true,
})

const config = {
  ...baseConfig,
  collectCoverageFrom: [baseConfig.collectCoverageFrom ?? []].flat(),
  coveragePathIgnorePatterns: [
    'packages/helper-commander/src/command/main.ts',
    'packages/helper-commander/src/command/sub.ts',
    'packages/helper-commander/src/util/git.ts',
    'packages/helper-commander/src/util/stdin.ts',
    'packages/helper-commander/src/util/yarn.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  extensionsToTreatAsEsm: ['.ts', '.mts'],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    chalk: require.resolve('chalk'),
    '#ansi-styles': path.join(
      require.resolve('chalk').split('chalk')[0],
      'chalk/source/vendor/ansi-styles/index.js',
    ),
    '#supports-color': path.join(
      require.resolve('chalk').split('chalk')[0],
      'chalk/source/vendor/supports-color/index.js',
    ),
  },
}

module.exports = config
