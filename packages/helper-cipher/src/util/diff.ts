import { list2map } from '@guanghechen/helper-func'
import { FileChangeType } from '../constant'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
} from '../types/IFileCipherCatalogItem'

export const isSameFileCipherItem = (
  oldItem: Readonly<IFileCipherCatalogItem>,
  newItem: Readonly<IFileCipherCatalogItem>,
): boolean => {
  if (oldItem === newItem) return true

  return (
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
