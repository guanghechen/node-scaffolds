import { isObject } from '@guanghechen/helper-is'
import dts from '@guanghechen/postcss-modules-dts'
import createBaseRollupConfig, { resolveRollupConfigEnvs } from '@guanghechen/rollup-config'
import type { IRollupConfigEnvs } from '@guanghechen/rollup-config'
import multiEntry from '@rollup/plugin-multi-entry'
import autoprefixer from 'autoprefixer'
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes'
import postcssUrl from 'postcss-url'
import type rollup from 'rollup'
import postcss from 'rollup-plugin-postcss'
import type {
  IPreprocessConfigOptions,
  IRollupConfigOptions,
  PostcssOptions,
} from './types/options'

/**
 * Create rollup config for preprocessor
 * @param options
 */
export function createPreprocessorConfig(
  options: IPreprocessConfigOptions,
  env: IRollupConfigEnvs,
): rollup.RollupOptions {
  const {
    input,
    output = {
      dir: 'node_modules/.cache/.rollup.preprocess.dts',
    },
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

  const precessStylesheetConfig: rollup.RollupOptions = {
    input: input as any,
    output: output,
    plugins: [
      multiEntry(multiEntryOptions),
      postcss({
        autoModules: false,
        extract: false,
        minimize: false,
        sourceMap: env.shouldSourceMap,
        plugins: [postcssUrlOptions && postcssUrl(postcssUrlOptions)].filter(Boolean),
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
export function createRollupConfigs(options: IRollupConfigOptions): rollup.RollupOptions[] {
  const { preprocessOptions, ...baseOptions } = options
  const env = resolveRollupConfigEnvs(options)

  const { postcssOptions: _postcssOptions, ...pluginOptions } = baseOptions.pluginOptions || {}
  const { autoprefixerOptions, flexbugsFixesOptions, postcssUrlOptions, ...postcssOptions } =
    _postcssOptions || {}

  baseOptions.pluginOptions = pluginOptions
  baseOptions.additionalPlugins = [
    _postcssOptions &&
      postcss({
        autoModules: false,
        sourceMap: env.shouldSourceMap,
        plugins: [
          autoprefixer({ ...autoprefixerOptions }),
          postcssFlexbugsFixes({ ...flexbugsFixesOptions }),
          postcssUrlOptions && postcssUrl(postcssUrlOptions),
        ].filter(Boolean),
        ...postcssOptions,
      }),
    ...(baseOptions.additionalPlugins || []),
  ].filter((x): x is rollup.Plugin => Boolean(x))

  const config = createBaseRollupConfig(baseOptions)

  // Resolve preprocess config.
  if (preprocessOptions != null) {
    const preprocessConfig = createPreprocessorConfig(preprocessOptions, env)
    return [preprocessConfig, ...config]
  }

  return config
}
