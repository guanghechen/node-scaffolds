import type { FileChangeTypeEnum } from '../constant'
import type { IDeserializedCatalogItem } from '../item'

export interface IDeserializedCatalogDiffItemAdded {
  changeType: FileChangeTypeEnum.ADDED
  newItem: IDeserializedCatalogItem
}

export interface IDeserializedCatalogDiffItemModified {
  changeType: FileChangeTypeEnum.MODIFIED
  oldItem: IDeserializedCatalogItem
  newItem: IDeserializedCatalogItem
}
export interface IDeserializedCatalogDiffItemRemoved {
  changeType: FileChangeTypeEnum.REMOVED
  oldItem: IDeserializedCatalogItem
}

export type IDeserializedCatalogDiffItem =
  | IDeserializedCatalogDiffItemAdded
  | IDeserializedCatalogDiffItemModified
  | IDeserializedCatalogDiffItemRemoved
