const fs = require('fs-extra')
const path = require('path')

const moduleNameMapper = {}
const hasTsconfig = fs.existsSync('./tsconfig.json')

if (hasTsconfig) {
  const { compilerOptions } = require('./tsconfig')
  for (const moduleName of Object.getOwnPropertyNames(compilerOptions.paths)) {
    const paths = compilerOptions.paths[moduleName].map(p =>
      path.resolve(__dirname, p),
    )
    let pattern = '^' + moduleName.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&') + '$'
    moduleNameMapper[pattern] = paths.length === 1 ? paths[0] : paths
  }
}

module.exports = {
  bail: true,
  verbose: true,
  errorOnDeprecated: true,
  roots: ['src', '__test__']
    .filter(p => fs.existsSync(p))
    .map(p => `<rootDir>/${p}`),
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
  testURL: 'http://localhost/',
  testEnvironment: 'node',
  testRegex: '/(__test__)/[^/]+\\.spec\\.[jt]sx?$',
  testPathIgnorePatterns: ['/coverage/', '/lib/', '/node_modules/'],
  collectCoverage: false,
  coverageDirectory: '<rootDir>/coverage/',
  collectCoverageFrom: [
    '<rootDir>/index.js',
    '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/*.{js,jsx,ts,tsx}',
  ],
  coveragePathIgnorePatterns: [],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  coverageReporters: ['lcov', 'text', 'text-summary'],
}
