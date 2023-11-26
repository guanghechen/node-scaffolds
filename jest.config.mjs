/* eslint-disable import/no-extraneous-dependencies */
import { tsMonorepoConfig } from '@guanghechen/jest-config'
import path from 'node:path'
import url from 'node:url'

export default async function () {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
  const { default: manifest } = await import(path.resolve('package.json'), {
    assert: { type: 'json' },
  })
  const baseConfig = await tsMonorepoConfig(__dirname, {
    useESM: true,
    tsconfigFilepath: path.join(__dirname, 'tsconfig.test.esm.json'),
  })

  const config = {
    ...baseConfig,
    collectCoverageFrom: [...(baseConfig.collectCoverageFrom ?? [])],
    coveragePathIgnorePatterns: [
      'packages/helper-commander/src/command/main.ts',
      'packages/helper-commander/src/command/sub.ts',
      'packages/helper-commander/src/util/git.ts',
      'packages/helper-commander/src/util/stdin.ts',
      'packages/helper-commander/src/util/yarn.ts',
      'packages/helper-npm/src/index.d.ts',
      'packages/script-doc-link/src/cli.ts',
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 90,
        lines: 90,
        statements: 90,
      },
      ...coverageMap[manifest.name],
    },
    extensionsToTreatAsEsm: ['.ts', '.mts'],
  }
  return config
}

const coverageMap = {
  '@guanghechen/helper-plop': {
    'src/cli.ts': { functions: 0, lines: 27, statements: 27 },
    'src/run/types.ts': { branches: 0, functions: 0, lines: 0, statements: 0 },
    'src/run/util.ts': { branches: 10, functions: 50, lines: 50, statements: 50 },
  },
  '@guanghechen/helper-string': {
    'src/vender/change-case.ts': { branches: 53, functions: 82 },
    'src/vender/title-case.ts': { branches: 50 },
  },
  '@guanghechen/rollup-config': {
    'src/config.ts': { branches: 66 },
    'src/env.ts': { branches: 50 },
    'src/external.ts': { branches: 70 },
    'src/middleware/dts.ts': { branches: 60 },
    'src/middleware/ts.ts': { branches: 50 },
    'src/plugin/modify.ts': { branches: 0, functions: 0, lines: 0, statements: 0 },
    'src/preset/dts.ts': { branches: 60 },
  },
}
