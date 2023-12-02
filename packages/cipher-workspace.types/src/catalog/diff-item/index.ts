import type { FileChangeType } from '../../constant'
import type { ICatalogItem } from '../item'

export * from './deserialized'
export * from './draft'
export * from './serialized'

export interface ICatalogDiffItemAdded {
  changeType: FileChangeType.ADDED
  newItem: ICatalogItem
}

export interface ICatalogDiffItemModified {
  changeType: FileChangeType.MODIFIED
  oldItem: ICatalogItem
  newItem: ICatalogItem
}

export interface ICatalogDiffItemRemoved {
  changeType: FileChangeType.REMOVED
  oldItem: ICatalogItem
}

export type ICatalogDiffItem =
  | ICatalogDiffItemAdded
  | ICatalogDiffItemModified
  | ICatalogDiffItemRemoved

export interface ICatalogDiffItemCombine {
  changeType: FileChangeType
  newItem?: ICatalogItem
  oldItem?: ICatalogItem
}
