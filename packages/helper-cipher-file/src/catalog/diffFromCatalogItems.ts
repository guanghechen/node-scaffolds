import {
  FileChangeType,
  type ICatalogDiffItem,
  type ICatalogItem,
} from '@guanghechen/cipher-workspace.types'
import { mapIterable } from '@guanghechen/helper-func'
import { isSameFileCipherItem } from './isSameFileCipherItem'

export function diffFromCatalogItems(
  oldItemMap: ReadonlyMap<string, ICatalogItem>,
  newItemMap: ReadonlyMap<string, ICatalogItem>,
): ICatalogDiffItem[] {
  if (oldItemMap.size < 1) {
    return mapIterable(newItemMap.values(), newItem => ({
      changeType: FileChangeType.ADDED,
      newItem,
    }))
  }

  if (newItemMap.size < 1) {
    return mapIterable(oldItemMap.values(), oldItem => ({
      changeType: FileChangeType.REMOVED,
      oldItem,
    }))
  }

  const addedItems: ICatalogDiffItem[] = []
  const modifiedItems: ICatalogDiffItem[] = []
  const removedItems: ICatalogDiffItem[] = []

  // Collect removed and modified items.
  for (const oldItem of oldItemMap.values()) {
    const newItem = newItemMap.get(oldItem.plainFilepath)
    if (newItem === undefined) {
      removedItems.push({
        changeType: FileChangeType.REMOVED,
        oldItem,
      })
    } else {
      if (!isSameFileCipherItem(oldItem, newItem)) {
        modifiedItems.push({
          changeType: FileChangeType.MODIFIED,
          oldItem,
          newItem,
        })
      }
    }
  }

  // Collect added items.
  for (const newItem of newItemMap.values()) {
    if (!oldItemMap.has(newItem.plainFilepath)) {
      addedItems.push({
        changeType: FileChangeType.ADDED,
        newItem,
      })
    }
  }

  return [...removedItems, ...addedItems, ...modifiedItems]
}
