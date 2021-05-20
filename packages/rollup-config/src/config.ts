import {
  collectAllDependencies,
  createDependencyFields,
} from '@guanghechen/npm-helper'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import { convertToBoolean, coverBoolean, isArray } from './option-helper'
import type {
  RawRollupConfigEnvs,
  RollupConfigEnvs,
  RollupConfigOptions,
} from './types'
import type { OutputOptions, RollupOptions } from 'rollup'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const builtinModules = require('builtin-modules')

const builtinExternals: string[] = builtinModules.concat(['glob', 'sync'])

/**
 * Resolve RollupConfigEnvs
 *
 * @param rawEnv
 * @returns
 */
export function resolveRollupConfigEnvs(
  rawEnv: RawRollupConfigEnvs,
): RollupConfigEnvs {
  const defaultShouldSourcemap = coverBoolean(
    true,
    convertToBoolean(process.env.ROLLUP_SHOULD_SOURCEMAP),
  )
  const defaultShouldExternalAll = coverBoolean(
    true,
    convertToBoolean(process.env.ROLLUP_EXTERNAL_ALL_DEPENDENCIES),
  )

  const {
    shouldSourceMap = defaultShouldSourcemap,
    shouldExternalAll = defaultShouldExternalAll,
  } = rawEnv
  return { shouldSourceMap, shouldExternalAll }
}

/**
 * Create a rollup options.
 * @param options
 */
export function createRollupConfig(
  options: RollupConfigOptions,
): RollupOptions {
  const env = resolveRollupConfigEnvs(options)

  const { manifest, pluginOptions = {}, additionalPlugins = [] } = options

  const {
    commonjsOptions,
    jsonOptions,
    nodeResolveOptions,
    typescriptOptions,
  } = pluginOptions

  const dependencyFields = createDependencyFields()
  let dependencies: string[] = dependencyFields.reduce((acc, key) => {
    const deps = manifest[key]
    const result: string[] = isArray(deps) ? deps : Object.keys(deps || {})
    return acc.concat(result)
  }, [] as string[])
  if (env.shouldExternalAll) {
    dependencies = collectAllDependencies(
      null,
      dependencyFields,
      dependencies,
      () => true,
    )
  }
  const externalSet = new Set(builtinExternals.concat(dependencies))

  const config: RollupOptions = {
    input: manifest.source,
    output: [
      manifest.main && {
        file: manifest.main,
        format: 'cjs',
        exports: 'named',
        sourcemap: env.shouldSourceMap,
      },
      manifest.module && {
        file: manifest.module,
        format: 'es',
        exports: 'named',
        sourcemap: env.shouldSourceMap,
      },
    ].filter((x): x is OutputOptions | any => Boolean(x)),
    external: function (id: string): boolean {
      const m = /^([.][\s\S]*|@[^/\s]+[/][^/\s]+|[^/\s]+)/.exec(id)
      if (m == null) return false
      return externalSet.has(m[1])
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        ...nodeResolveOptions,
      }),
      json({
        indent: '  ',
        namedExports: true,
        ...jsonOptions,
      }),
      typescript({
        clean: true,
        useTsconfigDeclarationDir: true,
        include: ['**/*.tsx', '**/*.ts'],
        tsconfigDefaults: {
          compilerOptions: {
            declaration: true,
            declarationMap: true,
            declarationDir: 'lib/types',
            outDir: 'lib',
          },
        },
        tsconfigOverride: {
          compilerOptions: {
            declarationMap: env.shouldSourceMap,
          },
        },
        ...typescriptOptions,
      }),
      commonjs({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        ...commonjsOptions,
      }),
      ...additionalPlugins,
    ],
  }
  return config
}
