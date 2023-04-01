import type { IRollupConfigOptions as IBaseRollupConfigOptions } from '@guanghechen/rollup-config'
import type { RollupMultiEntryOptions } from '@rollup/plugin-multi-entry'
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
export type { RollupMultiEntryOptions as MultiEntryOptions } from '@rollup/plugin-multi-entry'
export type { Options as PostcssPluginAutoprefixerOptions } from 'autoprefixer'
export type { Options as PostcssPluginPostcssUrlOptions } from 'postcss-url'
export type { PostCSSPluginConf as PostcssOptions } from 'rollup-plugin-postcss'

/**
 * Params for creating a rollup config.
 */
export interface IRollupConfigOptions extends IBaseRollupConfigOptions {
  /**
   * Options on preprocess phase (such as generate *.d.ts for css files).
   */
  preprocessOptions?: IPreprocessConfigOptions
}

/**
 * Preprocess config
 */
export interface IPreprocessConfigOptions {
  /**
   * Rollup input config
   */
  input: rollup.InputOption
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
      flexbugsFixesOptions?: IPostcssPluginFlexbugsFixesOptions
      /**
       * options for postcss-url
       * @see https://github.com/postcss/postcss-url#readme
       */
      postcssUrlOptions?: PostcssPluginPostcssUrlOptions
    }
  }
}

export interface IPostcssPluginFlexbugsFixesOptions {
  /**
   * @default true
   * @see https://github.com/luisrudge/postcss-flexbugs-fixes#bug-4
   */
  bug4?: boolean
  /**
   * @default true
   * @see https://github.com/luisrudge/postcss-flexbugs-fixes#bug-6
   */
  bug6?: boolean
  /**
   * @default true
   * @see https://github.com/luisrudge/postcss-flexbugs-fixes#bug-81a
   */
  bug8a?: boolean
}
