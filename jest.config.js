// eslint-disable-next-line import/no-extraneous-dependencies
const { tsMonorepoConfig } = require('@guanghechen/jest-config')

const baseConfig = tsMonorepoConfig(__dirname)

module.exports = {
  ...baseConfig,
  collectCoverageFrom: [...(baseConfig.collectCoverageFrom ?? []), '<rootDir>/gatsby-node.js'],
  coveragePathIgnorePatterns: [
    'packages/helper-commander/src/command.ts',
    'packages/helper-commander/src/git.ts',
    'packages/helper-commander/src/stdin.ts',
    'packages/helper-commander/src/yarn.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  moduleNameMapper: {
    ...(baseConfig.moduleNameMapper ?? {}),
  },
  setupFiles: [...(baseConfig.setupFiles ?? [])],
  transform: {
    ...(baseConfig.transform ?? {}),
  },
}
