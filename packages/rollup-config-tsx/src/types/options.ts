import './postcss-flexbugs-fixes'

import type {
  IRollupConfigOptions as IBaseRollupConfigOptions,
  IRollupPluginOptions as IBaseRollupPluginOptions,
} from '@guanghechen/rollup-config'
import type { RollupMultiEntryOptions } from '@rollup/plugin-multi-entry'
import type { Options as PostcssPluginAutoprefixerOptions } from 'autoprefixer'
import type { Options as PostcssPluginFlexbugsFixesOptions } from 'postcss-flexbugs-fixes'
import type { Options as PostcssPluginPostcssUrlOptions } from 'postcss-url'
import type rollup from 'rollup'
import type { PostCSSPluginConf as PostcssOptions } from 'rollup-plugin-postcss'

export type {
  CommonJSOptions,
  JsonOptions,
  NodeResolveOptions,
  TypescriptOptions,
} from '@guanghechen/rollup-config'
export type { RollupMultiEntryOptions as MultiEntryOptions } from '@rollup/plugin-multi-entry'
export type { Options as PostcssPluginAutoprefixerOptions } from 'autoprefixer'
export type { Options as PostcssPluginPostcssUrlOptions } from 'postcss-url'
export type { PostCSSPluginConf as PostcssOptions } from 'rollup-plugin-postcss'

/**
 * Params for creating a rollup config.
 */
export interface IRollupConfigOptions extends IBaseRollupConfigOptions {
  /**
   * Options of the builtin plugin by the @guanghechen/rollup-config.
   */
  pluginOptions?: IRollupPluginOptions
  /**
   * Options on preprocess phase (such as generate *.d.ts for css files).
   */
  preprocessOptions?: IPreprocessConfigOptions
}

/**
 * Options of the builtin plugins.
 */
export interface IRollupPluginOptions extends IBaseRollupPluginOptions {
  /**
   * options for rollup-plugin-postcss
   * @see https://github.com/egoist/rollup-plugin-postcss
   */
  postcssOptions?: PostcssOptions & {
    /**
     * options for autoprefixer
     * @see https://github.com/postcss/autoprefixer
     */
    autoprefixerOptions?: PostcssPluginAutoprefixerOptions
    /**
     * options for postcss-flexbugs-fixes
     * @see https://github.com/luisrudge/postcss-flexbugs-fixes#readme
     */
    flexbugsFixesOptions?: PostcssPluginFlexbugsFixesOptions
    /**
     * options for postcss-url
     * @see https://github.com/postcss/postcss-url#readme
     */
    postcssUrlOptions?: PostcssPluginPostcssUrlOptions
  }
}

/**
 * Preprocess config
 */
export interface IPreprocessConfigOptions {
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
    multiEntryOptions?: RollupMultiEntryOptions
    /**
     * options for rollup-plugin-postcss
     */
    postcssOptions?: PostcssOptions & {
      /**
       * options for postcss-url
       */
      postcssUrlOptions?: PostcssPluginPostcssUrlOptions
    }
  }
}
