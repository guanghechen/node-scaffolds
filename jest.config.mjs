/* eslint-disable import/no-extraneous-dependencies */
import { tsMonorepoConfig } from '@guanghechen/jest-config'
import path from 'node:path'
import url from 'node:url'

export default async function () {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
  const packageDir = path.relative(__dirname, path.resolve()) + '/'
  const baseConfig = await tsMonorepoConfig(__dirname, {
    useESM: true,
    tsconfigFilepath: path.join(__dirname, 'tsconfig.test.esm.json'),
  })

  const config = {
    ...baseConfig,
    collectCoverageFrom: [baseConfig.collectCoverageFrom ?? []].flat(),
    coveragePathIgnorePatterns: [
      'packages/helper-commander/src/command/main.ts',
      'packages/helper-commander/src/command/sub.ts',
      'packages/helper-commander/src/util/git.ts',
      'packages/helper-commander/src/util/stdin.ts',
      'packages/helper-commander/src/util/yarn.ts',
      'packages/script-doc-link/src/cli.ts',
    ],
    coverageThreshold: Object.fromEntries(
      [
        ['global', { branches: 80, functions: 90, lines: 90, statements: 90 }],
        ['packages/helper-plop/src/cli.ts', { functions: 0, lines: 27, statements: 27 }],
        [
          'packages/helper-plop/src/run/types.ts',
          { branches: 0, functions: 0, lines: 0, statements: 0 },
        ],
        [
          'packages/helper-plop/src/run/util.ts',
          { branches: 10, functions: 50, lines: 50, statements: 50 },
        ],
        ['packages/rollup-config/src/config.ts', { branches: 66 }],
        ['packages/rollup-config/src/middleware/dts.ts', { branches: 60 }],
        ['packages/rollup-config/src/middleware/ts.ts', { branches: 50 }],
      ]
        .filter(([p]) => !p.startsWith('packages/') || p.startsWith(packageDir))
        .map(([p, val]) => (p.startsWith(packageDir) ? [path.join(__dirname, p), val] : [p, val])),
    ),
    extensionsToTreatAsEsm: ['.ts', '.mts'],
    moduleNameMapper: {
      ...baseConfig.moduleNameMapper,
    },
  }
  return config
}
