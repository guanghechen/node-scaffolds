import { mapIterable } from '@guanghechen/helper-func'
import type { IFileCipherCatalogDiffItem } from '../types/IFileCipherCatalogDiffItem'
import { FileChangeType } from '../types/IFileCipherCatalogDiffItem'
import type { IFileCipherCatalogItem } from '../types/IFileCipherCatalogItem'
import { isSameFileCipherItem } from './isSameFileCipherItem'

export interface IDiffFromCatalogItemsParams {
  oldItemMap: ReadonlyMap<string, IFileCipherCatalogItem>
  newItemMap: ReadonlyMap<string, IFileCipherCatalogItem>
}

export function diffFromCatalogItems(
  params: IDiffFromCatalogItemsParams,
): IFileCipherCatalogDiffItem[] {
  const { oldItemMap, newItemMap } = params
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

  const addedItems: IFileCipherCatalogDiffItem[] = []
  const modifiedItems: IFileCipherCatalogDiffItem[] = []
  const removedItems: IFileCipherCatalogDiffItem[] = []

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
