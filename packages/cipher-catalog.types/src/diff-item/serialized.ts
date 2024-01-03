import type { FileChangeTypeEnum } from '../constant'
import type { ISerializedCatalogItem } from '../item'

export interface ISerializedCatalogDiffItemAdded {
  changeType: FileChangeTypeEnum.ADDED
  newItem: ISerializedCatalogItem
}

export interface ISerializedCatalogDiffItemModified {
  changeType: FileChangeTypeEnum.MODIFIED
  oldItem: ISerializedCatalogItem
  newItem: ISerializedCatalogItem
}
export interface ISerializedCatalogDiffItemRemoved {
  changeType: FileChangeTypeEnum.REMOVED
  oldItem: ISerializedCatalogItem
}

export type ISerializedCatalogDiffItem =
  | ISerializedCatalogDiffItemAdded
  | ISerializedCatalogDiffItemModified
  | ISerializedCatalogDiffItemRemoved
