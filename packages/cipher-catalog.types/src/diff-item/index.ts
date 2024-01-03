import type { FileChangeTypeEnum } from '../constant'
import type { ICatalogItem } from '../item'

export * from './deserialized'
export * from './draft'
export * from './serialized'

export interface ICatalogDiffItemAdded {
  changeType: FileChangeTypeEnum.ADDED
  newItem: ICatalogItem
}

export interface ICatalogDiffItemModified {
  changeType: FileChangeTypeEnum.MODIFIED
  oldItem: ICatalogItem
  newItem: ICatalogItem
}

export interface ICatalogDiffItemRemoved {
  changeType: FileChangeTypeEnum.REMOVED
  oldItem: ICatalogItem
}

export type ICatalogDiffItem =
  | ICatalogDiffItemAdded
  | ICatalogDiffItemModified
  | ICatalogDiffItemRemoved

export interface ICatalogDiffItemCombine {
  changeType: FileChangeTypeEnum
  newItem?: ICatalogItem
  oldItem?: ICatalogItem
}
