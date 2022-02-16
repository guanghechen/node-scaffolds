import createBaseRollupConfig from '@guanghechen/rollup-config'
import type { RollupConfigOptions as BaseRollupConfigOptions } from '@guanghechen/rollup-config'
import copy from '@guanghechen/rollup-plugin-copy'
import type { IOptions as RollupPluginCopyOptions } from '@guanghechen/rollup-plugin-copy'
import type { RollupOptions } from 'rollup'

export interface RollupConfigOptions extends BaseRollupConfigOptions {
  /**
   * Options of @guanghechen/rollup-plugin-copy, for coping resources or config files.
   */
  resources?: RollupPluginCopyOptions
  /**
   * Node.js bin targets.
   */
  targets: Array<{
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
}

export function createRollupConfig(options: RollupConfigOptions): RollupOptions[] {
  const { resources, targets, ...baseOptions } = options
  const baseConfig = createBaseRollupConfig(baseOptions)

  const { plugins = [] } = baseConfig
  const external = baseConfig.external as (id: string) => boolean

  const configs: RollupOptions[] = [
    {
      ...baseConfig,
      plugins: [...plugins, copy(resources)],
    },
    ...targets.map(
      (item): RollupOptions => ({
        input: item.src,
        output: [
          {
            file: item.target,
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
            banner: '#! /usr/bin/env node',
          },
        ],
        external: (id: string): boolean => {
          if (external(id)) return true
          return /\.\/index$/.test(id) || /^[.]+$/.test(id)
        },
        plugins,
      }),
    ),
  ]
  return configs
}

export default createRollupConfig
