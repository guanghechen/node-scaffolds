import type { Plugin } from 'rollup'
import dts from 'rollup-plugin-dts'
import type { DtsOptions, IPresetConfigBuilder, IPresetRollupConfig } from '../types'
import { PresetBuilderName } from '../types'

export interface IDtsPresetConfigBuilderOptions {
  /**
   * Additional plugins.
   */
  additionalPlugins?: Plugin[] | undefined
  /**
   * Options for rollup-plugin-dts
   */
  dtsOptions?: DtsOptions | undefined
}

export function dtsPresetConfigBuilder(
  options: IDtsPresetConfigBuilderOptions = {},
): IPresetConfigBuilder {
  const { additionalPlugins = [], dtsOptions } = options

  return {
    name: PresetBuilderName.DTS,
    build: ({ env, manifest, baseExternal }) => {
      const external = (id: string): boolean => {
        if (id === manifest.name + '/package.json') return true
        return baseExternal(id)
      }

      const plugins: Plugin[] = [
        dts({
          ...dtsOptions,
          compilerOptions: {
            removeComments: false,
            sourceMap: env.sourcemap,
            declaration: true,
            declarationMap: false,
            emitDeclarationOnly: true,
            ...dtsOptions?.compilerOptions,
          },
        }),
        ...additionalPlugins,
      ]

      const config: IPresetRollupConfig = {
        external,
        plugins,
      }
      return config
    },
  }
}
