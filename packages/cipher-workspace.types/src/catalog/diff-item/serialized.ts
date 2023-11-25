import { FileChangeType } from '../../constant'
import { ISerializedCatalogItem } from '../item'

export interface ISerializedCatalogDiffItemAdded {
  changeType: FileChangeType.ADDED
  newItem: ISerializedCatalogItem
}

export interface ISerializedCatalogDiffItemModified {
  changeType: FileChangeType.MODIFIED
  oldItem: ISerializedCatalogItem
  newItem: ISerializedCatalogItem
}
export interface ISerializedCatalogDiffItemRemoved {
  changeType: FileChangeType.REMOVED
  oldItem: ISerializedCatalogItem
}

export type ISerializedCatalogDiffItem =
  | ISerializedCatalogDiffItemAdded
  | ISerializedCatalogDiffItemModified
  | ISerializedCatalogDiffItemRemoved

