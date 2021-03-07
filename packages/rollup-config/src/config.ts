import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import type { OutputOptions, RollupOptions } from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import collectAllDependencies, { dependencyKeys } from './dependency-helper'
import { convertToBoolean, coverBoolean, isArray } from './option-helper'
import type { RollupConfigOptions } from './types'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const builtinModules = require('builtin-modules')

const builtinExternals: string[] = builtinModules.concat(['glob', 'sync'])

/**
 * Create a rollup options.
 * @param props
 */
export function createRollupConfig(props: RollupConfigOptions): RollupOptions {
  const defaultShouldSourcemap = coverBoolean(
    true,
    convertToBoolean(process.env.ROLLUP_SHOULD_SOURCEMAP),
  )
  const defaultShouldExternalAll = coverBoolean(
    true,
    convertToBoolean(process.env.ROLLUP_EXTERNAL_ALL_DEPENDENCIES),
  )

  const {
    manifest,
    pluginOptions = {},
    additionalPlugins = [],
    shouldSourceMap = defaultShouldSourcemap,
    shouldExternalAll = defaultShouldExternalAll,
  } = props

  const {
    commonjsOptions,
    jsonOptions,
    nodeResolveOptions,
    typescriptOptions,
  } = pluginOptions

  let dependencies: string[] = dependencyKeys().reduce((acc, key) => {
    const deps = manifest[key]
    const result: string[] = isArray(deps) ? deps : Object.keys(deps || {})
    return acc.concat(result)
  }, [] as string[])
  if (shouldExternalAll) {
    dependencies = collectAllDependencies(
      null,
      dependencyKeys(),
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
        sourcemap: shouldSourceMap,
      },
      manifest.module && {
        file: manifest.module,
        format: 'es',
        exports: 'named',
        sourcemap: shouldSourceMap,
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
            declarationMap: shouldSourceMap,
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
