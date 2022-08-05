const fs = require('fs')
const path = require('path')

/**
 * Calculate moduleNameMapper from tsconfig.compilerOptions.paths
 * @param {string} rootDir
 * @param {string|undefined} tsconfigFilename
 * @returns {Record<string, string | string[]>}
 */
function resolveModuleNameMapper(rootDir, tsconfigFilename = 'tsconfig.json') {
  const tsconfigFilepath = path.resolve(rootDir, tsconfigFilename)
  if (!fs.existsSync(tsconfigFilepath)) return {}

  const tsconfig = require(tsconfigFilepath)
  if (tsconfig.compilerOptions == null || tsconfig.compilerOptions.paths == null) {
    return {}
  }

  const mapper = {}
  const pathAlias = Object.entries(tsconfig.compilerOptions.paths)
  for (const [moduleName, modulePaths] of pathAlias) {
    const paths = modulePaths.map(p => {
      let index = 0
      const filepath = path.join(rootDir, p)
      return filepath.replace(/[*]+/g, () => {
        index += 1
        return '$' + index
      })
    })
    let pattern =
      '^' + moduleName.replace(/[-\\^$+?.()|[\]{}]/g, '\\$&').replace(/[*]/g, '(.+)') + '$'
    mapper[pattern] = paths.length === 1 ? paths[0] : paths
  }
  return mapper
}

/**
 * Create basic jest config
 * @params {string} repositoryRootDir
 */
function tsMonorepoConfig(repositoryRootDir) {
  const moduleNameMapper = {
    ...resolveModuleNameMapper(repositoryRootDir),
    ...resolveModuleNameMapper(path.resolve()),
  }

  return {
    bail: true,
    verbose: true,
    errorOnDeprecated: true,
    roots: ['src', '__test__'].filter(p => fs.existsSync(p)).map(p => `<rootDir>/${p}`),
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper,
    globals: {
      'ts-jest': {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    },
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testEnvironment: 'node',
    testEnvironmentOptions: {
      url: 'http://localhost/',
    },
    testRegex: '/(__test__)/[^/]+\\.spec\\.[jt]sx?$',
    testPathIgnorePatterns: ['/coverage/', '/lib/', '/node_modules/'],
    collectCoverage: false,
    coverageDirectory: '<rootDir>/coverage/',
    collectCoverageFrom: [
      '<rootDir>/cli.js',
      '<rootDir>/index.js',
      '<rootDir>/src/*.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
    ],
    coveragePathIgnorePatterns: [],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    coverageReporters: ['text', 'text-summary'],
  }
}

module.exports = {
  tsMonorepoConfig,
  resolveModuleNameMapper,
}
