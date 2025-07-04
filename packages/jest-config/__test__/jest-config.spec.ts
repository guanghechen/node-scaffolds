import path from 'node:path'
import url from 'node:url'
import { resolveModuleNameMapper, tsMonorepoConfig } from '../src'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const originalCwd = process.cwd()
afterEach(() => {
  process.chdir(originalCwd)
})

const resolveFixturePath = (p: string): string => path.join(__dirname, 'fixtures', p)
const desensitizeModuleNameMapper = (
  moduleNameMapper: Record<string, string | string[]> | undefined,
): Record<string, string | string[]> => {
  const result: Record<string, string | string[]> = {}
  if (moduleNameMapper) {
    for (const key of Object.keys(moduleNameMapper)) {
      const values = moduleNameMapper[key]
      if (Array.isArray(values)) {
        result[key] = values.map(p => '<WORKSPACE>/' + path.relative(__dirname, p))
      } else {
        result[key] = '<WORKSPACE>/' + path.relative(__dirname, values)
      }
    }
  }
  return result
}
const desensitizePath = (p: string | null | undefined): string | null | undefined => {
  if (p === undefined) return undefined
  if (p === null) return null
  return '<WORKSPACE>/' + path.relative(__dirname, p)
}

describe('resolveModuleNameMapper', () => {
  it('basic', async () => {
    const moduleNameMapper = await resolveModuleNameMapper(resolveFixturePath('basic'))
    expect(desensitizeModuleNameMapper(moduleNameMapper)).toEqual({
      '^@/(.+)$': '<WORKSPACE>/fixtures/basic/src/$1',
    })
  })

  it('no tsconfig.json', async () => {
    const moduleNameMapper = await resolveModuleNameMapper(resolveFixturePath('__fictitious__0'))
    expect(desensitizeModuleNameMapper(moduleNameMapper)).toEqual({})
  })

  it('custom tsconfig name', async () => {
    const moduleNameMapper = await resolveModuleNameMapper(
      resolveFixturePath('custom-tsconfig-name'),
      'tsconfig.lib.json',
    )
    expect(desensitizeModuleNameMapper(moduleNameMapper)).toEqual({
      '^@/(.+)$': [
        '<WORKSPACE>/fixtures/custom-tsconfig-name/src/$1',
        '<WORKSPACE>/fixtures/custom-tsconfig-name/script/$1',
      ],
    })
  })

  it('empty', async () => {
    const moduleNameMapper = await resolveModuleNameMapper(resolveFixturePath('empty'))
    expect(moduleNameMapper).toEqual({})
  })

  it('not exists', async () => {
    const moduleNameMapper = await resolveModuleNameMapper(
      resolveFixturePath('empty'),
      'tsconfig.json',
    )
    expect(moduleNameMapper).toEqual({})
  })
})

describe('tsMonorepoConfig', () => {
  it('basic', async () => {
    const rootDir = resolveFixturePath('basic')
    process.chdir(rootDir)
    const config = await tsMonorepoConfig(rootDir)
    config.moduleNameMapper = desensitizeModuleNameMapper(config.moduleNameMapper)
    config.prettierPath = desensitizePath(config.prettierPath)

    expect(config).toMatchInlineSnapshot(`
      {
        "bail": 1,
        "collectCoverage": false,
        "collectCoverageFrom": [
          "<rootDir>/cli.js",
          "<rootDir>/index.js",
          "<rootDir>/src/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}",
          "<rootDir>/src/**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}",
        ],
        "coverageDirectory": "<rootDir>/coverage/",
        "coveragePathIgnorePatterns": [],
        "coverageProvider": "v8",
        "coverageReporters": [
          "text",
          "text-summary",
        ],
        "coverageThreshold": {
          "global": {
            "branches": 80,
            "functions": 80,
            "lines": 80,
            "statements": 80,
          },
        },
        "errorOnDeprecated": true,
        "moduleFileExtensions": [
          "ts",
          "tsx",
          "js",
          "jsx",
          "json",
          "mts",
          "mjs",
          "cts",
          "cjs",
          "node",
        ],
        "moduleNameMapper": {
          "^@/(.+)$": "<WORKSPACE>/fixtures/basic/src/$1",
        },
        "prettierPath": undefined,
        "roots": [
          "<rootDir>/src",
        ],
        "testEnvironment": "node",
        "testEnvironmentOptions": {
          "url": "http://localhost/",
        },
        "testPathIgnorePatterns": [
          "/coverage/",
          "/lib/",
          "/node_modules/",
        ],
        "testRegex": "/(__test__)/[^_][\\s\\S]+\\.spec\\.[cm]?[jt]sx?$",
        "transform": {
          "^.+\\.[cm]?tsx?$": [
            "ts-jest",
            {
              "tsconfig": "<rootDir>/tsconfig.json",
              "useESM": undefined,
            },
          ],
        },
        "verbose": true,
      }
    `)
  })

  it('useESM', async () => {
    const rootDir = resolveFixturePath('basic')
    process.chdir(rootDir)
    const config = await tsMonorepoConfig(rootDir, { useESM: true })
    config.moduleNameMapper = desensitizeModuleNameMapper(config.moduleNameMapper)
    config.prettierPath = desensitizePath(config.prettierPath)

    expect(config).toMatchInlineSnapshot(`
      {
        "bail": 1,
        "collectCoverage": false,
        "collectCoverageFrom": [
          "<rootDir>/cli.js",
          "<rootDir>/index.js",
          "<rootDir>/src/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}",
          "<rootDir>/src/**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}",
        ],
        "coverageDirectory": "<rootDir>/coverage/",
        "coveragePathIgnorePatterns": [],
        "coverageProvider": "v8",
        "coverageReporters": [
          "text",
          "text-summary",
        ],
        "coverageThreshold": {
          "global": {
            "branches": 80,
            "functions": 80,
            "lines": 80,
            "statements": 80,
          },
        },
        "errorOnDeprecated": true,
        "moduleFileExtensions": [
          "ts",
          "tsx",
          "js",
          "jsx",
          "json",
          "mts",
          "mjs",
          "cts",
          "cjs",
          "node",
        ],
        "moduleNameMapper": {
          "^@/(.+)$": "<WORKSPACE>/fixtures/basic/src/$1",
        },
        "preset": "ts-jest/presets/default-esm",
        "prettierPath": undefined,
        "roots": [
          "<rootDir>/src",
        ],
        "testEnvironment": "node",
        "testEnvironmentOptions": {
          "url": "http://localhost/",
        },
        "testPathIgnorePatterns": [
          "/coverage/",
          "/lib/",
          "/node_modules/",
        ],
        "testRegex": "/(__test__)/[^_][\\s\\S]+\\.spec\\.[cm]?[jt]sx?$",
        "transform": {
          "^.+\\.[cm]?tsx?$": [
            "ts-jest",
            {
              "tsconfig": "<rootDir>/tsconfig.json",
              "useESM": true,
            },
          ],
        },
        "verbose": true,
      }
    `)
  })
})
