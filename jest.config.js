// eslint-disable-next-line import/no-extraneous-dependencies
const { tsMonorepoConfig } = require('@guanghechen/jest-config')

const baseConfig = tsMonorepoConfig(__dirname)

module.exports = {
  ...baseConfig,
  collectCoverageFrom: [...baseConfig.collectCoverageFrom, '<rootDir>/gatsby-node.js'],
  coveragePathIgnorePatterns: [
    'packages/commander-helper/src/command.ts',
    'packages/commander-helper/src/git.ts',
    'packages/commander-helper/src/yarn.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
}
