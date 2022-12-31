// eslint-disable-next-line import/no-extraneous-dependencies
const { tsMonorepoConfig } = require('@guanghechen/jest-config')

const baseConfig = tsMonorepoConfig(__dirname, {
  useESM: true,
})

module.exports = {
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
    ...(baseConfig.moduleNameMapper ?? {}),
  },
  setupFiles: [...(baseConfig.setupFiles ?? [])],
  transform: {
    ...(baseConfig.transform ?? {}),
  },
}
