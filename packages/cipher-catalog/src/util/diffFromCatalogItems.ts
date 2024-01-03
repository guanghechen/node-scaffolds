import type { ICatalogDiffItem, ICatalogItem } from '@guanghechen/cipher-catalog.types'
import { FileChangeTypeEnum } from '@guanghechen/cipher-catalog.types'
import { iterable2map, mapIterable } from '@guanghechen/internal'
import { areSameCatalogItem } from './areSameCatalogItem'

/**
 * Calculate diff items with the new catalog items.
 * @param oldItemMap
 * @param newItems
 */
export function diffFromCatalogItems(
  oldItemMap: ReadonlyMap<string, ICatalogItem>,
  newItems: Iterable<ICatalogItem>,
): ICatalogDiffItem[] {
  if (oldItemMap.size < 1) {
    return mapIterable(newItems, newItem => ({ changeType: FileChangeTypeEnum.ADDED, newItem }))
  }

  const newItemMap: Map<string, ICatalogItem> = iterable2map(newItems, item => item.plainPath)
  if (newItemMap.size < 1) {
    return mapIterable(oldItemMap.values(), oldItem => ({
      changeType: FileChangeTypeEnum.REMOVED,
      oldItem,
    }))
  }

  const addedItems: ICatalogDiffItem[] = []
  const modifiedItems: ICatalogDiffItem[] = []
  const removedItems: ICatalogDiffItem[] = []

  // Collect removed and modified items.
  for (const oldItem of oldItemMap.values()) {
    const newItem = newItemMap.get(oldItem.plainPath)
    if (newItem === undefined) {
      removedItems.push({
        changeType: FileChangeTypeEnum.REMOVED,
        oldItem,
      })
    } else {
      if (!areSameCatalogItem(oldItem, newItem)) {
        modifiedItems.push({
          changeType: FileChangeTypeEnum.MODIFIED,
          oldItem,
          newItem,
        })
      }
    }
  }

  // Collect added items.
  for (const newItem of newItemMap.values()) {
    if (!oldItemMap.has(newItem.plainPath)) {
      addedItems.push({
        changeType: FileChangeTypeEnum.ADDED,
        newItem,
      })
    }
  }

  return [...removedItems, ...addedItems, ...modifiedItems]
}
