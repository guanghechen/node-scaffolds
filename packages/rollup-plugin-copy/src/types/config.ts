import type { WriteFileOptions } from 'fs'
import type { IOptionRename, IOptionTransform } from './option'

export interface IConfig {
  /**
   * Array of targets to copy.
   * @default []
   */
  targets: IConfigTarget[]
  /**
   * Copy items once. Useful in watch mode
   */
  copyOnce: boolean
  /**
   * Remove the directory structure of copied files.
   */
  flatten: boolean
  /**
   * Output copied items to console.
   */
  verbose: boolean
  /**
   * Rollup hook the plugin should use.
   *
   * By default, plugin runs when rollup has finished bundling,
   * before bundle is written to disk.
   */
  hook: string
  /**
   * Rollup hook the plugin watch mode should use.
   *
   * By default, plugin runs in watch mode when rollup start bundling.
   */
  watchHook: string
  /**
   * Options for fs.write / fs.copy
   */
  writeFileOptions: WriteFileOptions
}

export interface IConfigTarget extends Exclude<IConfigTransform, 'hook' | 'watchHook'> {
  /**
   * Path or glob of what to copy.
   */
  src: string[]
  /**
   * Multiple destinations.
   */
  dest: string[]
  /**
   * Specify the rule to change destination file or folder name.
   */
  rename: IConfigRename
  /**
   * Modify file contents
   */
  transform?: IConfigTransform
}

export type IConfigRename = Exclude<IOptionRename, 'string'>

export type IConfigTransform = IOptionTransform
