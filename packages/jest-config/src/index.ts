import type { Config } from 'jest'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Calculate moduleNameMapper from tsconfig.compilerOptions.paths
 */
export async function resolveModuleNameMapper(
  rootDir: string,
  tsconfigFilename = 'tsconfig.json',
): Promise<Record<string, string | string[]>> {
  const tsconfigFilepath = path.resolve(rootDir, tsconfigFilename)
  if (!fs.existsSync(tsconfigFilepath)) return {}

  const { default: tsconfig } = await import(tsconfigFilepath, { assert: { type: 'json' } })
  if (tsconfig.compilerOptions == null || tsconfig.compilerOptions.paths == null) {
    return {}
  }

  const mapper = {}
  const pathAlias = tsconfig.compilerOptions.paths as Record<string, string[]>
  for (const moduleName of Object.keys(pathAlias)) {
    const modulePaths: string[] = pathAlias[moduleName]
    const paths = modulePaths.map(p => {
      let index = 0
      const filepath = path.join(rootDir, p)
      return filepath.replace(/[*]+/g, () => {
        index += 1
        return '$' + index
      })
    })
    const pattern =
      '^' + moduleName.replace(/[-\\^$+?.()|[\]{}]/g, '\\$&').replace(/[*]/g, '(.+)') + '$'
    mapper[pattern] = paths.length === 1 ? paths[0] : paths
  }
  return mapper
}

/**
 * Create basic jest config
 */
export async function tsMonorepoConfig(
  repositoryRootDir: string,
  options: { useESM?: boolean } = {},
): Promise<Config> {
  const moduleNameMapper = {
    ...(await resolveModuleNameMapper(repositoryRootDir)),
    ...(await resolveModuleNameMapper(path.resolve())),
  }

  return {
    bail: 1,
    verbose: true,
    errorOnDeprecated: true,
    roots: ['src', '__test__'].filter(p => fs.existsSync(p)).map(p => `<rootDir>/${p}`),
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mts', 'mjs', 'cts', 'cjs', 'node'],
    moduleNameMapper,
    transform: {
      '^.+\\.[cm]?tsx?$': [
        'ts-jest',
        {
          tsconfig: '<rootDir>/tsconfig.json',
          useESM: options?.useESM,
        },
      ],
    },
    testEnvironment: 'node',
    testEnvironmentOptions: {
      url: 'http://localhost/',
    },
    testRegex: '/(__test__)/[^/]+\\.spec\\.[cm]?[jt]sx?$',
    testPathIgnorePatterns: ['/coverage/', '/lib/', '/node_modules/'],
    collectCoverage: false,
    collectCoverageFrom: [
      '<rootDir>/cli.js',
      '<rootDir>/index.js',
      '<rootDir>/src/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}',
      '<rootDir>/src/**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}',
    ],
    coverageDirectory: '<rootDir>/coverage/',
    coveragePathIgnorePatterns: [],
    coverageProvider: 'v8',
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
