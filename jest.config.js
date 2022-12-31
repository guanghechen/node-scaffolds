// eslint-disable-next-line import/no-extraneous-dependencies
const { tsMonorepoConfig } = require('@guanghechen/jest-config')

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
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    chalk: '<rootDir>/node_modules/chalk/source/index.js',
    '#ansi-styles': '<rootDir>/node_modules/chalk/source/vendor/ansi-styles/index.js',
    '#supports-color': '<rootDir>/node_modules/chalk/source/vendor/supports-color/index.js',
  },
  setupFiles: [...(baseConfig.setupFiles ?? [])],
  transform: {
    ...(baseConfig.transform ?? {}),
  },
}

module.exports = config
