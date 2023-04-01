import { isObject } from '@guanghechen/helper-is'
import dts from '@guanghechen/postcss-modules-dts'
import type { IEnv, IPresetConfigBuilder } from '@guanghechen/rollup-config'
import {
  PresetBuilderName,
  buildRollupConfig,
  resolveRollupConfigEnv,
  tsPresetConfigBuilder,
} from '@guanghechen/rollup-config'
import multiEntry from '@rollup/plugin-multi-entry'
import autoprefixer from 'autoprefixer'
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes'
import postcssUrl from 'postcss-url'
import type { Plugin, RollupOptions } from 'rollup'
import postcss from 'rollup-plugin-postcss'
import type { IPreprocessConfigOptions, IRollupConfigOptions, PostcssOptions } from './types'

/**
 * Create rollup config for preprocessor
 * @param options
 */
export function createPreprocessorConfig(
  options: IPreprocessConfigOptions,
  env: IEnv,
): RollupOptions {
  const {
    input,
    output = { dir: 'node_modules/.cache/.rollup.preprocess.dts' },
    pluginOptions = {},
  } = options

  const { multiEntryOptions, postcssOptions: _postcssOptions } = pluginOptions
  const { postcssUrlOptions, ...postcssOptions } = _postcssOptions || {}

  let modules: PostcssOptions['modules'] = undefined
  if (isObject(postcssOptions?.modules)) {
    modules = { ...postcssOptions?.modules, ...dts(postcssOptions?.modules) }
  } else if (postcssOptions?.modules) {
    modules = { ...dts() }
  }

  const precessStylesheetConfig: RollupOptions = {
    input,
    output,
    plugins: [
      multiEntry(multiEntryOptions),
      postcss({
        autoModules: false,
        extract: false,
        minimize: false,
        sourceMap: env.sourcemap,
        plugins: [postcssUrlOptions && postcssUrl(postcssUrlOptions)].filter(Boolean),
        ...postcssOptions,
        modules,
      }),
    ] as Plugin[],
  }
  return precessStylesheetConfig
}

/**
 * Create rollup config for handle react component
 * @param options
 */
export async function createRollupConfigs(options: IRollupConfigOptions): Promise<RollupOptions[]> {
  const { preprocessOptions, ...baseOptions } = options
  const { autoprefixerOptions, flexbugsFixesOptions, postcssUrlOptions, ...postcssOptions } =
    preprocessOptions?.pluginOptions?.postcssOptions || {}

  const env = resolveRollupConfigEnv(options.env ?? {})
  const additionalPlugins = [
    postcss({
      autoModules: false,
      sourceMap: env.sourcemap,
      plugins: [
        autoprefixer({ ...autoprefixerOptions }),
        postcssFlexbugsFixes({ ...flexbugsFixesOptions }),
        postcssUrlOptions && postcssUrl(postcssUrlOptions),
      ].filter(Boolean),
      ...postcssOptions,
    }),
  ]
  let presetConfigBuilders: IPresetConfigBuilder[] = baseOptions.presetConfigBuilders ?? []
  presetConfigBuilders = presetConfigBuilders.some(builder => builder.name === PresetBuilderName.TS)
    ? presetConfigBuilders.map(builder =>
        builder.name === PresetBuilderName.TS
          ? {
              ...builder,
              build: async ctx => {
                const config = await builder.build(ctx)
                return {
                  ...config,
                  plugins: [...config.plugins, ...additionalPlugins],
                }
              },
            }
          : builder,
      )
    : [tsPresetConfigBuilder({ additionalPlugins })]

  // Resolve preprocess config.
  const { configs } = await buildRollupConfig({ ...baseOptions, presetConfigBuilders })
  if (preprocessOptions != null) {
    const preprocessConfig = createPreprocessorConfig(preprocessOptions, env)
    return [preprocessConfig, ...configs]
  }
  return configs
}
