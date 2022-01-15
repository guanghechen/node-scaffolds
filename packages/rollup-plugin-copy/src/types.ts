import type { WriteFileOptions } from 'fs-extra'

/**
 * Copy target option
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
export interface RollupPluginCopyTargetOption extends WriteFileOptions, RollupPluginCopyOptions {
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
  rename?: string | ((name: string, ext: string) => string)
  /**
   * Modify file contents
   *
   * @param content   content of srcPath
   * @param srcPath   source filepath
   * @param dstPath   target filepath
   */
  transform?(
    content: string | ArrayBuffer,
    srcPath: string,
    dstPath: string,
  ): Promise<string | ArrayBuffer>
}

/**
 * Options of @guanghechen/rollup-plugin-copy
 */
export interface RollupPluginCopyOptions extends WriteFileOptions {
  /**
   * Array of targets to copy.
   * @default []
   */
  targets?: RollupPluginCopyTargetOption[]
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
}

/**
 * Copy target item
 */
export interface RollupPluginCopyTargetItem {
  /**
   * Path or glob of what to copy
   */
  src: string
  /**
   * Destinations where to copy
   */
  dest: string
  /**
   * Renamed
   */
  renamed: boolean
  /**
   * Transformed
   */
  transformed: boolean
  /**
   * Source contents
   */
  contents?: string | ArrayBuffer
}
