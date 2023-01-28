import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import type { OutputOptions, RollupOptions } from 'rollup'
import dts from 'rollup-plugin-dts'
import builtinModules from './builtin-modules.json' assert { type: 'json' }
import { collectAllDependencies, getDefaultDependencyFields } from './dependency'
import type {
  IRawRollupConfigEnvs,
  IRollupConfigEnvs,
  IRollupConfigOptions,
  IRollupManifestOptions,
} from './types'
import { convertToBoolean, coverBoolean, isArray } from './util'

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
export async function createRollupConfig(options: IRollupConfigOptions): Promise<RollupOptions[]> {
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
    dependencies = await collectAllDependencies(null, dependencyFields, dependencies, () => true)
  }
  const externalSet = new Set(builtinExternals.concat(dependencies))

  const external = (id: string): boolean => {
    if (/^node:[\w\S]+$/.test(id)) return true

    const m = /^([.][\s\S]*|@[^/\s]+[/][^/\s]+|[^/\s]+)/.exec(id)
    if (m == null) return false
    return externalSet.has(m[1])
  }

  const config: RollupOptions[] = [
    {
      input: manifest.source,
      output: resolveOutputOptions({ env, manifest }),
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

function resolveOutputOptions(options: {
  env: IRollupConfigEnvs
  manifest: IRollupManifestOptions
}): OutputOptions[] {
  interface IEntry {
    file: string
    format: 'esm' | 'cjs'
  }

  const { env, manifest } = options
  const entries: IEntry[] = []
  const addEntry = (entry: IEntry): void => {
    if (!entries.some(item => item.file === entry.file && item.format === entry.format)) {
      entries.push(entry)
    }
  }

  if (manifest.main) addEntry({ format: 'cjs', file: manifest.main })
  if (manifest.module) addEntry({ format: 'esm', file: manifest.module })
  if (manifest.exports) {
    const e = manifest.exports
    if (typeof e === 'string') addEntry({ format: 'esm', file: e })
    else {
      if (typeof e.import === 'string') addEntry({ format: 'esm', file: e.import })
      if (typeof e.require === 'string') addEntry({ format: 'cjs', file: e.require })

      const r = e['.']
      if (r) {
        if (typeof r.import === 'string') addEntry({ format: 'esm', file: r.import })
        if (typeof r.require === 'string') addEntry({ format: 'cjs', file: r.require })
      }
    }
  }

  const outputs: OutputOptions[] = entries.map(entry => ({
    format: entry.format,
    file: entry.file,
    exports: 'named',
    sourcemap: env.shouldSourceMap,
  }))
  return outputs
}
