import type { CopyOptions, WriteFileOptions } from 'fs-extra'
import type { GlobbyOptions } from 'globby'

/**
 * Options of @guanghechen/rollup-plugin-copy
 *
 * # Examples
 *
 *  * File
 *    ```typescript
 *    copy({ targets: [{ src: 'src/index.html', dest: 'dist/public' }] })
 *    ```
 *
 *  * Folder
 *    ```typescript
 *    copy({ targets: [{ src: 'assets/images', dest: 'dist/public' }] })
 *    ```
 *
 *  * Glob
 *    ```typescript
 *    copy({ targets: [{ src: 'assets/*', dest: 'dist/public' }] })
 *    ```
 *
 *    - Glob: multiple items
 *      ```typescript
 *      copy({ targets: [{
 *        src: ['src/index.html', 'src/styles.css', 'assets/images'],
 *        dest: 'dist/public' }] })
 *      ```
 *
 *    - Glob: negated patterns
 *      ```typescript
 *      copy({ targets: [{
 *        src: ['assets/images/***\/*', '!***\/*.gif'],
          dest: 'dist/public/images' }] })
 *      ```
 *
 *  * Multiple destinations
 *    ```typescript
 *    copy({
 *      targets: [
 *        { src: 'src/index.html', dest: ['dist/public', 'build/public'] }
 *      ]
 *    })
 *    ```
 *
 *  * Rename with a string
 *    ```typescript
 *    copy({
 *      targets: [
 *        { src: 'src/app.html', dest: 'dist/public', rename: 'index.html' }
 *      ]
 *    })
 *    ```
 *
 *  * Rename with a function
 *    ```typescript
 *    copy({
 *      targets: [{
 *        src: 'assets/docs/*',
 *        dest: 'dist/public/docs',
 *        rename: (name, extension) => `${name}-v1.${extension}`
 *      }]
 *    })
 *    ```
 *
 *  * Transform file contents
 *    ```typescript
 *    copy({
 *      targets: [{
 *        src: 'src/index.html',
 *        dest: 'dist/public',
 *        transform: (contents) =>
 *          contents.toString().replace('__SCRIPT__', 'app.js')
 *      }]
 *    })
 *    ```
 */
export interface IOptions {
  /**
   * Array of targets to copy.
   * @default []
   */
  targets?: IOptionTarget[]
  /**
   * Copy items once. Useful in watch mode
   * @default false
   */
  copyOnce?: boolean
  /**
   * Remove the directory structure of copied files.
   * @default true
   */
  flatten?: boolean
  /**
   * Output copied items to console.
   * @default false
   */
  verbose?: boolean
  /**
   * Rollup hook the plugin should use.
   *
   * By default, plugin runs when rollup has finished bundling,
   * before bundle is written to disk.
   * @default buildEnd
   */
  hook?: string
  /**
   * Rollup hook the plugin watch mode should use.
   *
   * By default, plugin runs in watch mode when rollup start bundling.
   * @default buildStart
   */
  watchHook?: string
  /**
   * Default options of 'globby'.
   */
  globbyOptions?: GlobbyOptions
  /**
   * Default options of 'fs-extra'.
   */
  fsExtraOptions?: {
    copy?: CopyOptions
    outputFile?: WriteFileOptions | BufferEncoding | string
  }
}

// Type of elements of copyOptions.targets.
export interface IOptionTarget {
  /**
   * Path or glob of what to copy
   */
  src: string | string[]
  /**
   * One or more destinations where to copy
   */
  dest: string | string[]
  /**
   * Change destination file or folder name
   */
  rename?: IOptionRename
  /**
   * Modify file contents
   */
  transform?: IOptionTransform
  /**
   * Copy items once. Useful in watch mode
   * @default false
   */
  copyOnce?: boolean
  /**
   * Remove the directory structure of copied files.
   * @default true
   */
  flatten?: boolean
  /**
   * Output copied items to console.
   * @default true
   */
  verbose?: boolean
  /**
   * Default options of 'globby'.
   */
  globbyOptions?: GlobbyOptions
  /**
   * Default options of 'fs-extra'.
   */
  fsExtraOptions?: {
    copy?: CopyOptions
    outputFile?: WriteFileOptions | BufferEncoding | string
  }
}

/**
 * Rename the target filename.
 *
 * @param name
 */
export type IOptionRename = ((name: string, ext: string, srcPath: string) => string) | string

/**
 * Modify file contents
 *
 * @param content   content of srcPath
 * @param srcPath   source filepath
 * @param dstPath   target filepath
 */
export type IOptionTransform = (
  content: string | ArrayBuffer,
  srcPath: string,
  dstPath: string,
) => Promise<string | ArrayBuffer>
