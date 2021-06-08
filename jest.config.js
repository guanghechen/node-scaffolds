const { tsMonorepoConfig } = require('@guanghechen/jest-config')

const baseConfig = tsMonorepoConfig(__dirname)

module.exports = {
  ...baseConfig,
  collectCoverageFrom: [
    ...baseConfig.collectCoverageFrom,
    '<rootDir>/gatsby-node.js',
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
