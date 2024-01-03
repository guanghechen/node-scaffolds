import type { FileChangeTypeEnum } from '../constant'
import type { ICatalogItem, IDraftCatalogItem } from '../item'

export interface IDraftCatalogDiffItemAdded {
  changeType: FileChangeTypeEnum.ADDED
  newItem: IDraftCatalogItem
}

export interface IDraftCatalogDiffItemModified {
  changeType: FileChangeTypeEnum.MODIFIED
  oldItem: ICatalogItem
  newItem: IDraftCatalogItem
}

export interface IDraftCatalogDiffItemRemoved {
  changeType: FileChangeTypeEnum.REMOVED
  oldItem: ICatalogItem
}

export type IDraftCatalogDiffItem =
  | IDraftCatalogDiffItemAdded
  | IDraftCatalogDiffItemModified
  | IDraftCatalogDiffItemRemoved
