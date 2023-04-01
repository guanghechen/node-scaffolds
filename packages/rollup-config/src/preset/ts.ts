import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import type { Plugin } from 'rollup'
import { PresetBuilderName } from '../types'
import type {
  CommonJSOptions,
  IPresetConfigBuilder,
  IPresetRollupConfig,
  JsonOptions,
  NodeResolveOptions,
  TypescriptOptions,
} from '../types'

export interface ITsPresetConfigBuilderOptions {
  /**
   * Additional plugins.
   */
  additionalPlugins?: Plugin[] | undefined
  /**
   * Options for @rollup/plugin-commonjs
   */
  commonjsOptions?: CommonJSOptions | undefined
  /**
   * Options for @rollup/plugin-json
   */
  jsonOptions?: JsonOptions | undefined
  /**
   * Options for @rollup/plugin-node-resolve
   */
  nodeResolveOptions?: NodeResolveOptions | undefined
  /**
   * Options for @rollup/plugin-typescript
   */
  typescriptOptions?: TypescriptOptions | undefined
}

export function tsPresetConfigBuilder(
  options: ITsPresetConfigBuilderOptions = {},
): IPresetConfigBuilder {
  const {
    additionalPlugins = [], //
    commonjsOptions,
    jsonOptions,
    nodeResolveOptions,
    typescriptOptions,
  } = options

  return {
    name: PresetBuilderName.TS,
    build: ({ env, baseExternal }) => {
      const external = baseExternal

      const plugins: Plugin[] = [
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
            sourceMap: env.sourcemap,
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
      ]

      const presetConfig: IPresetRollupConfig = {
        external,
        plugins,
      }
      return presetConfig
    },
  }
}
