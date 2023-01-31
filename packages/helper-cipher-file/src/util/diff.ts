import { list2map } from '@guanghechen/helper-func'
import { FileChangeType } from '../constant'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
  IFileCipherCatalogItemDiffCombine,
} from '../types/IFileCipherCatalogItem'

export const isSameFileCipherItem = (
  oldItem: Readonly<IFileCipherCatalogItem>,
  newItem: Readonly<IFileCipherCatalogItem>,
): boolean => {
  if (oldItem === newItem) return true

  return (
    oldItem.sourceFilepath === newItem.sourceFilepath &&
    oldItem.encryptedFilepath === newItem.encryptedFilepath &&
    oldItem.fingerprint === newItem.fingerprint &&
    oldItem.size === newItem.size &&
    oldItem.keepPlain === newItem.keepPlain
  )
}

export const diffFileCipherItems = (
  oldItems: ReadonlyArray<IFileCipherCatalogItem>,
  newItems: ReadonlyArray<IFileCipherCatalogItem>,
): IFileCipherCatalogItemDiff[] => {
  if (oldItems.length <= 0) {
    return newItems.map(newItem => ({ changeType: FileChangeType.ADDED, newItem }))
  }

  if (newItems.length <= 0) {
    return oldItems.map(oldItem => ({ changeType: FileChangeType.REMOVED, oldItem }))
  }

  const addedItems: IFileCipherCatalogItemDiff[] = []
  const modifiedItems: IFileCipherCatalogItemDiff[] = []
  const removedItems: IFileCipherCatalogItemDiff[] = []

  {
    const newItemMap: Map<string, IFileCipherCatalogItem> = list2map(
      newItems,
      item => item.sourceFilepath,
    )
    for (const oldItem of oldItems) {
      const newItem = newItemMap.get(oldItem.sourceFilepath)
      if (newItem === undefined) {
        removedItems.push({
          changeType: FileChangeType.REMOVED,
          oldItem,
        })
      } else if (!isSameFileCipherItem(oldItem, newItem)) {
        modifiedItems.push({
          changeType: FileChangeType.MODIFIED,
          oldItem,
          newItem,
        })
      }
    }
    newItemMap.clear()
  }

  {
    const oldItemMap: Map<string, IFileCipherCatalogItem> = list2map(
      oldItems,
      item => item.sourceFilepath,
    )
    for (const newItem of newItems) {
      if (!oldItemMap.has(newItem.sourceFilepath)) {
        addedItems.push({
          changeType: FileChangeType.ADDED,
          newItem,
        })
      }
    }
    oldItemMap.clear()
  }

  return [...removedItems, ...addedItems, ...modifiedItems]
}

export const collectAffectedSrcFilepaths = (
  diffItems: ReadonlyArray<IFileCipherCatalogItemDiff>,
): string[] => {
  const files: Set<string> = new Set()
  const collect = (item: IFileCipherCatalogItem): void => {
    files.add(item.sourceFilepath)
  }

  for (let i = 0; i < diffItems.length; ++i) {
    const item = diffItems[i] as IFileCipherCatalogItemDiffCombine
    if (item.oldItem) collect(item.oldItem)
    if (item.newItem) collect(item.newItem)
  }
  return Array.from(files)
}

export const collectAffectedEncFilepaths = (
  diffItems: ReadonlyArray<IFileCipherCatalogItemDiff>,
): string[] => {
  const files: Set<string> = new Set()
  const collect = (item: IFileCipherCatalogItem): void => {
    if (item.encryptedFileParts.length > 1) {
      for (const filePart of item.encryptedFileParts) {
        files.add(item.encryptedFilepath + filePart)
      }
    } else {
      files.add(item.encryptedFilepath)
    }
  }

  for (let i = 0; i < diffItems.length; ++i) {
    const item = diffItems[i] as IFileCipherCatalogItemDiffCombine
    if (item.oldItem) collect(item.oldItem)
    if (item.newItem) collect(item.newItem)
  }
  return Array.from(files)
}
