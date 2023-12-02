import type { FileChangeType } from '../../constant'
import type { ICatalogItem, IDraftCatalogItem } from '../item'

export interface IDraftCatalogDiffItemAdded {
  changeType: FileChangeType.ADDED
  newItem: IDraftCatalogItem
}

export interface IDraftCatalogDiffItemModified {
  changeType: FileChangeType.MODIFIED
  oldItem: ICatalogItem
  newItem: IDraftCatalogItem
}

export interface IDraftCatalogDiffItemRemoved {
  changeType: FileChangeType.REMOVED
  oldItem: ICatalogItem
}

export type IDraftCatalogDiffItem =
  | IDraftCatalogDiffItemAdded
  | IDraftCatalogDiffItemModified
  | IDraftCatalogDiffItemRemoved
