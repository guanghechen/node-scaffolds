export * from './config'
export * from './option'

/**
 * Copy target item
 */
export interface ICopyTargetItem {
  /**
   * Source filepath.
   */
  src: string
  /**
   * Target filepath.
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
