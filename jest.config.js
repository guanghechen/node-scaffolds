const { tsMonorepoConfig } = require('@guanghechen/jest-config')

module.exports = {
  ...tsMonorepoConfig(__dirname),
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
}
