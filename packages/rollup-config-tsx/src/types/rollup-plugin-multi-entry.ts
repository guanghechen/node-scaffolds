declare module '@rollup/plugin-multi-entry' {
  import type { Plugin } from 'rollup'

  /**
   * @see https://github.com/rollup/plugins/blob/master/packages/multi-entry/README.md#options
   */
  export interface MultiEntryOptions {
    /**
     * If true, instructs the plugin to export named exports to the bundle
     * from all entries. If false, the plugin will not export any entry exports
     * to the bundle.
     * This can be useful when wanting to combine code from multiple entry
     * files, but not necessarily to export each entry file's exports.
     *
     * @default true
     */
    exports?: boolean
  }

  export function multiEntry(options?: MultiEntryOptions): Plugin
  export default multiEntry
}
