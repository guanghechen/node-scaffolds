import type { IConfigTarget } from './config'

export * from './config'
export * from './option'

/**
 * Copy target item
 */
export interface ICopyTargetItem {
  /**
   * Source filepath.
   */
  srcPath: string
  /**
   * Target filepath.
   */
  destPath: string
  /**
   * Renamed
   */
  renamed: boolean
  /**
   * Transformed
   */
  transformed: boolean
  /**
   * This item is processing
   */
  copying: boolean
  /**
   * When the target pushed into the processing queue.
   */
  queueingTimestamp: number
  /**
   * Source contents
   */
  contents?: string | ArrayBuffer
  /**
   * Related target item.
   */
  target: Readonly<IConfigTarget>
}
