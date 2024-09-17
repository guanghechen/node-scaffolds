import invariant from '@guanghechen/invariant'
import { PresetBuilderName, buildRollupConfig } from '@guanghechen/rollup-config'
import type { IRollupConfigOptions as IBaseRollupConfigOptions } from '@guanghechen/rollup-config'
import copy from '@guanghechen/rollup-plugin-copy'
import type { IOptions as IRollupPluginCopyOptions } from '@guanghechen/rollup-plugin-copy'
import type { ModuleFormat, RollupOptions } from 'rollup'

export interface IRollupConfigOptions extends IBaseRollupConfigOptions {
  /**
   * Node.js bin targets.
   */
  targets: Array<{
    /**
     * Target format.
     */
    format?: ModuleFormat
    /**
     * Source file path, such as 'src/cli.ts'.
     */
    src: string
    /**
     * Target file path, such as 'lib/cjs/cli.js'.
     * The target filepath should be placed in the same directory as the entry file.
     */
    target: string
  }>
  /**
   * Options of @guanghechen/rollup-plugin-copy, for coping resources or config files.
   */
  resources?: IRollupPluginCopyOptions
}

export async function createRollupConfig(options: IRollupConfigOptions): Promise<RollupOptions[]> {
  const { resources, targets, ...baseOptions } = options
  const { configs: baseConfigs, presetMap } = await buildRollupConfig(baseOptions)

  const tsPresetConfig = presetMap.get(PresetBuilderName.TS)
  invariant(!!tsPresetConfig, `Cannot find ${PresetBuilderName.TS} preset config.`)

  const external = (tsPresetConfig.external ?? (() => false)) as (id: string) => boolean
  let configs: RollupOptions[] = [
    ...baseConfigs,
    ...targets.map(
      (item): RollupOptions => ({
        ...tsPresetConfig,
        input: item.src,
        output: [
          {
            file: item.target,
            format: item.format,
            exports: 'named',
            sourcemap: true,
            banner: '#! /usr/bin/env node',
          },
        ],
        external: (id: string): boolean => {
          if (external(id)) return true
          return /\.\/index$/.test(id) || /\.\/index\.(js|mjs)$/.test(id) || /^[.]+$/.test(id)
        },
      }),
    ),
  ]

  if (resources) {
    invariant(configs.length > 0, 'Cannot find valid rollup input')
    const copyPlugin = copy(resources)
    let plugins = await configs[0].plugins

    if (Array.isArray(plugins)) plugins = [...plugins, copyPlugin]
    else if (!plugins) plugins = [copyPlugin]
    else plugins = [plugins, copyPlugin]

    configs = [
      {
        ...configs[0],
        plugins,
      },
      ...configs.slice(1),
    ]
  }
  return configs
}

export default createRollupConfig
