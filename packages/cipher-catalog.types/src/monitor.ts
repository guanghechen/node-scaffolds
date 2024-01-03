import type { CatalogItemChangeType } from './constant'
import type { ICatalogDiffItem } from './diff-item'

export interface ICatalogEventReset {
  type: CatalogItemChangeType.RESET
}

export interface ICatalogEventApplyDiff {
  type: CatalogItemChangeType.APPLY_DIFF
  diffItems: ReadonlyArray<ICatalogDiffItem>
}

export type ICatalogEvent = ICatalogEventReset | ICatalogEventApplyDiff

export interface ICipherCatalogMonitor {
  /**
   * On catalog item changed.
   * @param diffItems
   */
  onItemChanged(event: ICatalogEvent): void
}

export type IUnMonitorCipherCatalog = () => void
