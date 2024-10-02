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
    tsconfigFilepath: path.join(__dirname, 'tsconfig.test.json'),
  })

  const config = {
    ...baseConfig,
    collectCoverageFrom: [...(baseConfig.collectCoverageFrom ?? [])],
    coveragePathIgnorePatterns: [
      'packages/commander/src/main.ts',
      'packages/commander/src/sub.ts',
      'packages/commander/src/util.ts',
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
  '@guanghechen/cli': { global: { branches: 72 } },
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
