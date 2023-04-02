/* eslint-disable import/no-extraneous-dependencies */
import { tsMonorepoConfig } from '@guanghechen/jest-config'
import { resolve } from 'import-meta-resolve'
import path from 'node:path'
import url from 'node:url'

export default async function () {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
  const baseConfig = await tsMonorepoConfig(__dirname, { useESM: true })
  const { default: manifest } = await import(path.resolve('package.json'), {
    assert: { type: 'json' },
  })

  const chalkLocation = url.fileURLToPath(await resolve('chalk', import.meta.url))
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
        branches: 80,
        functions: 90,
        lines: 90,
        statements: 90,
        ...manifest.jest?.coverageThreshold?.global,
      },
    },
    extensionsToTreatAsEsm: ['.ts', '.mts'],
    moduleNameMapper: {
      ...baseConfig.moduleNameMapper,
      chalk: chalkLocation,
      '#ansi-styles': path.join(
        chalkLocation.split('chalk')[0],
        'chalk/source/vendor/ansi-styles/index.js',
      ),
      '#supports-color': path.join(
        chalkLocation.split('chalk')[0],
        'chalk/source/vendor/supports-color/index.js',
      ),
    },
  }
  return config
}
