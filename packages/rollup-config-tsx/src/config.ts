import { isObject } from '@guanghechen/option-helper'
import dts from '@guanghechen/postcss-modules-dts'
import createBaseRollupConfig from '@guanghechen/rollup-config'
import multiEntry from '@rollup/plugin-multi-entry'
import autoprefixer from 'autoprefixer'
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes'
import postcssUrl from 'postcss-url'
import type rollup from 'rollup'
import postcss from 'rollup-plugin-postcss'
import type {
  PostcssOptions,
  PreprocessConfigOptions,
  RollupConfigOptions,
} from './types/options'

/**
 * Create rollup config for preprocessor
 * @param options
 */
export function createPreprocessorConfig(
  options: PreprocessConfigOptions,
): rollup.RollupOptions {
  const {
    input,
    output = {
      dir: 'node_modules/.cache/.rollup.preprocess.dts',
    },
    pluginOptions = {},
  } = options

  const { multiEntryOptions, postcssOptions } = pluginOptions
  let modules: PostcssOptions['modules'] = undefined
  if (isObject(postcssOptions?.modules)) {
    modules = { ...postcssOptions?.modules, ...dts(postcssOptions?.modules) }
  } else if (postcssOptions?.modules) {
    modules = { ...dts() }
  }

  const precessStylesheetConfig: rollup.RollupOptions = {
    input: input as any,
    output: output,
    plugins: [
      multiEntry(multiEntryOptions),
      postcss({
        autoModules: false,
        extract: false,
        minimize: false,
        ...postcssOptions,
        modules,
      }),
    ] as rollup.Plugin[],
  }
  return precessStylesheetConfig
}

/**
 * Create rollup config for handle react component
 * @param options
 */
export function createRollupConfigs(
  options: RollupConfigOptions,
): rollup.RollupOptions[] {
  const { preprocessOptions, ...baseOptions } = options
  const { postcssOptions: _postcssOptions, ...pluginOptions } =
    baseOptions.pluginOptions || {}

  const { pluginOptions: postcssPluginOptions, ...postcssOptions } =
    _postcssOptions || {}
  const { autoprefixerOptions, postcssUrlOptions } = ((pluginOptions ||
    {}) as unknown) as any

  baseOptions.pluginOptions = pluginOptions
  baseOptions.additionalPlugins = [
    postcss({
      plugins: [
        postcssFlexbugsFixes({}),
        autoprefixer({ ...autoprefixerOptions }),
        postcssUrl({
          url: 'inline',
          ...postcssUrlOptions,
        }),
      ],
      ...postcssOptions,
    }) as rollup.Plugin,
    ...(baseOptions.additionalPlugins || []),
  ]

  const config = createBaseRollupConfig(baseOptions)

  // Resolve preprocess config.
  if (preprocessOptions != null) {
    const preprocessConfig = createPreprocessorConfig(preprocessOptions)
    return [preprocessConfig, config]
  }

  return [config]
}
