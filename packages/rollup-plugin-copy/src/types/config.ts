import type { Options as GlobbyOptions } from 'globby'
import type { CopyOptions, WriteFileOptions } from 'node:fs'
import type { IOptionTransform } from './option'

export interface IConfig {
  /**
   * Array of targets to copy.
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
   * Whether if show warning message if no valid target.
   */
  silentIfNoValidTargets: boolean
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
   * Default options of 'globby'.
   */
  globbyOptions: GlobbyOptions
  /**
   * Default options of 'fs'.
   */
  fsOptions: {
    copy: CopyOptions
    writeFile?: WriteFileOptions
  }
}

export interface IConfigTarget {
  /**
   * Path or glob of what to copy.
   */
  src: string[]
  /**
   * Watching glob patterns.
   */
  watchPatterns: string[]
  /**
   * Multiple destinations.
   */
  dest: string[]
  /**
   * Specify the rule to change destination file or folder name.
   */
  rename?: IConfigRename
  /**
   * Modify file contents
   */
  transform?: IConfigTransform
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
   * Default options of 'globby'.
   */
  globbyOptions: GlobbyOptions
  /**
   * Default options of 'node:fs'.
   */
  fsOptions: {
    copy: CopyOptions
    writeFile?: WriteFileOptions
  }
}

export type IConfigRename = (name: string, ext: string, srcPath: string) => string

export type IConfigTransform = IOptionTransform
