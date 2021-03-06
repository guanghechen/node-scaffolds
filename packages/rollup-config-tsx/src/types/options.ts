import './postcss-flexbugs-fixes'
import './rollup-plugin-multi-entry'

import type {
  RollupConfigOptions as BaseRollupConfigOptions,
  RollupPluginOptions as BaseRollupPluginOptions,
} from '@guanghechen/rollup-config'
import type { MultiEntryOptions } from '@rollup/plugin-multi-entry'
import type { Options as PostcssPluginAutoprefixerOptions } from 'autoprefixer'
import type { Options as PostcssPluginPostcssUrlOptions } from 'postcss-url'
import type rollup from 'rollup'
import type { PostCSSPluginConf as PostcssOptions } from 'rollup-plugin-postcss'

export type {
  CommonJSOptions,
  JsonOptions,
  NodeResolveOptions,
  TypescriptOptions,
} from '@guanghechen/rollup-config'
export type { Options as PostcssPluginAutoprefixerOptions } from 'autoprefixer'
export type { Options as PostcssPluginPostcssUrlOptions } from 'postcss-url'
export type { PostCSSPluginConf as PostcssOptions } from 'rollup-plugin-postcss'
export type { MultiEntryOptions } from '@rollup/plugin-multi-entry'

/**
 * Params for creating a rollup config.
 */
export interface RollupConfigOptions extends BaseRollupConfigOptions {
  /**
   * Options of the builtin plugin by the @guanghechen/rollup-config.
   */
  pluginOptions?: RollupPluginOptions
  /**
   * Options on preprocess phase (such as generate *.d.ts for css files).
   */
  preprocessOptions?: PreprocessConfigOptions
}

/**
 * Options of the builtin plugins.
 */
export interface RollupPluginOptions extends BaseRollupPluginOptions {
  /**
   * options for rollup-plugin-postcss
   * @see https://github.com/egoist/rollup-plugin-postcss
   */
  postcssOptions?: PostcssOptions & {
    pluginOptions?: {
      /**
       * options for autoprefixer
       */
      autoprefixerOptions?: PostcssPluginAutoprefixerOptions
      /**
       * options for postcss-url
       */
      postcssUrlOptions?: PostcssPluginPostcssUrlOptions
    }
  }
}

/**
 * Preprocess config
 */
export interface PreprocessConfigOptions {
  /**
   * Rollup input config
   */
  input: string | string[] | { include?: string[]; exclude?: string }
  /**
   * Rollup output config (required in `rollup -w` mode)
   */
  output?: rollup.OutputOptions | rollup.OutputOptions[]
  /**
   * Rollup plugin options
   */
  pluginOptions?: {
    /**
     * options for @rollup/plugin-multi-entry
     */
    multiEntryOptions?: MultiEntryOptions
    /**
     * options for rollup-plugin-postcss
     */
    postcssOptions?: PostcssOptions
  }
}
