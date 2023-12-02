import type { FileChangeType } from '../../constant'
import type { IDeserializedCatalogItem } from '../item'

export interface IDeserializedCatalogDiffItemAdded {
  changeType: FileChangeType.ADDED
  newItem: IDeserializedCatalogItem
}

export interface IDeserializedCatalogDiffItemModified {
  changeType: FileChangeType.MODIFIED
  oldItem: IDeserializedCatalogItem
  newItem: IDeserializedCatalogItem
}
export interface IDeserializedCatalogDiffItemRemoved {
  changeType: FileChangeType.REMOVED
  oldItem: IDeserializedCatalogItem
}

export type IDeserializedCatalogDiffItem =
  | IDeserializedCatalogDiffItemAdded
  | IDeserializedCatalogDiffItemModified
  | IDeserializedCatalogDiffItemRemoved
