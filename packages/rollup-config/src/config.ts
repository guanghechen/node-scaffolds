import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import type { OutputOptions, RollupOptions } from 'rollup'
import dts from 'rollup-plugin-dts'
import builtinModules from './builtin-modules.json'
import { collectAllDependencies, getDefaultDependencyFields } from './dependency'
import { convertToBoolean, coverBoolean, isArray } from './option-helper'
import type { IRawRollupConfigEnvs, IRollupConfigEnvs, IRollupConfigOptions } from './types'

const builtinExternals: string[] = builtinModules.concat(['glob', 'sync'])

/**
 * Resolve RollupConfigEnvs
 *
 * @param rawEnv
 * @returns
 */
export function resolveRollupConfigEnvs(rawEnv: IRawRollupConfigEnvs): IRollupConfigEnvs {
  const defaultShouldSourcemap = coverBoolean(
    true,
    convertToBoolean(process.env.ROLLUP_SHOULD_SOURCEMAP),
  )
  const defaultShouldExternalAll = coverBoolean(
    true,
    convertToBoolean(process.env.ROLLUP_EXTERNAL_ALL_DEPENDENCIES),
  )

  const { shouldSourceMap = defaultShouldSourcemap, shouldExternalAll = defaultShouldExternalAll } =
    rawEnv
  return { shouldSourceMap, shouldExternalAll }
}

/**
 * Create a rollup options.
 * @param options
 */
export function createRollupConfig(options: IRollupConfigOptions): RollupOptions[] {
  const env = resolveRollupConfigEnvs(options)

  const { manifest, pluginOptions = {}, additionalPlugins = [] } = options

  const { commonjsOptions, jsonOptions, nodeResolveOptions, typescriptOptions, dtsOptions } =
    pluginOptions

  const dependencyFields = getDefaultDependencyFields()
  let dependencies: string[] = dependencyFields.reduce((acc, key) => {
    const deps = manifest[key] as Record<string, string> | string[]
    const result: string[] = isArray(deps) ? deps : Object.keys(deps || {})
    return acc.concat(result)
  }, [] as string[])
  if (env.shouldExternalAll) {
    dependencies = collectAllDependencies(null, dependencyFields, dependencies, () => true)
  }
  const externalSet = new Set(builtinExternals.concat(dependencies))

  const external = (id: string): boolean => {
    const m = /^([.][\s\S]*|@[^/\s]+[/][^/\s]+|[^/\s]+)/.exec(id)
    if (m == null) return false
    return externalSet.has(m[1])
  }

  const config: RollupOptions[] = [
    {
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
      external,
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
          include: ['**/*.tsx', '**/*.ts'],
          ...typescriptOptions,
          compilerOptions: {
            // compilerOptions
            outDir: 'lib',
            removeComments: true,
            sourceMap: env.shouldSourceMap,

            ...typescriptOptions?.compilerOptions,

            declaration: false,
            declarationMap: false,
            declarationDir: undefined,
          },
        }),
        commonjs({
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          ...commonjsOptions,
        }),
        ...additionalPlugins,
      ],
    },
    manifest.types && [
      {
        input: manifest.source,
        output: [
          {
            file: manifest.types,
            format: 'es',
          },
        ],
        external: (id: string) => {
          if (id === manifest.name + '/package.json') return true
          return external(id)
        },
        plugins: [
          dts({
            ...dtsOptions,
            compilerOptions: {
              removeComments: false,
              sourceMap: env.shouldSourceMap,
              declaration: true,
              declarationMap: false,
              emitDeclarationOnly: true,
              ...dtsOptions?.compilerOptions,
            },
          }),
        ],
      },
    ],
  ]
    .filter((x: unknown): x is RollupOptions | RollupOptions[] => !!x)
    .flat() as RollupOptions[]
  return config
}
