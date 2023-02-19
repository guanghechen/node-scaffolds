import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemBase,
  IFileCipherCatalogItemDraft,
} from './IFileCipherCatalogItem'

export enum FileChangeType {
  ADDED = 'added',
  MODIFIED = 'modified',
  REMOVED = 'removed',
}

export interface IFileCipherCatalogDiffItemAdded<N extends IFileCipherCatalogItemBase> {
  changeType: FileChangeType.ADDED
  newItem: N
}

export interface IFileCipherCatalogDiffItemModified<
  O extends IFileCipherCatalogItemBase,
  N extends IFileCipherCatalogItemBase,
> {
  changeType: FileChangeType.MODIFIED
  oldItem: O
  newItem: N
}

export interface IFileCipherCatalogDiffItemRemoved<O extends IFileCipherCatalogItemBase> {
  changeType: FileChangeType.REMOVED
  oldItem: O
}

export type IFileCipherCatalogDiffItemBase<
  O extends IFileCipherCatalogItemBase = IFileCipherCatalogItemBase,
  N extends IFileCipherCatalogItemBase = O,
> =
  | IFileCipherCatalogDiffItemAdded<N>
  | IFileCipherCatalogDiffItemModified<O, N>
  | IFileCipherCatalogDiffItemRemoved<O>

export type IFileCipherCatalogDiffItemDraft = IFileCipherCatalogDiffItemBase<
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDraft
>

export type IFileCipherCatalogDiffItem = IFileCipherCatalogDiffItemBase<IFileCipherCatalogItem>

export interface IFileCipherCatalogDiffItemCombine {
  changeType: FileChangeType
  oldItem?: IFileCipherCatalogItem
  newItem?: IFileCipherCatalogItem
}
