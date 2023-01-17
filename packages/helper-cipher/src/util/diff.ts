import { list2map } from '@guanghechen/helper-func'
import { FileChangeType } from '../constant'
import type { IFileCipherItem, IFileCipherItemDiff } from '../types/cipher-item'

export const isSameFileCipherItem = (
  oldItem: Readonly<IFileCipherItem>,
  newItem: Readonly<IFileCipherItem>,
): boolean => {
  if (oldItem === newItem) return true

  return (
    oldItem.fingerprint === newItem.fingerprint &&
    oldItem.size === newItem.size &&
    oldItem.targetFilepath === newItem.targetFilepath
  )
}

export const diffFileCipherItems = (
  oldItems: ReadonlyArray<IFileCipherItem>,
  newItems: ReadonlyArray<IFileCipherItem>,
): IFileCipherItemDiff[] => {
  if (oldItems.length <= 0) {
    return newItems.map(newItem => ({ changeType: FileChangeType.ADDED, newItem }))
  }

  if (newItems.length <= 0) {
    return oldItems.map(oldItem => ({ changeType: FileChangeType.REMOVED, oldItem }))
  }

  const addedItems: IFileCipherItemDiff[] = []
  const modifiedItems: IFileCipherItemDiff[] = []
  const removedItems: IFileCipherItemDiff[] = []

  {
    const newItemMap: Map<string, IFileCipherItem> = list2map(newItems, item => item.sourceFilepath)
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
    const oldItemMap: Map<string, IFileCipherItem> = list2map(oldItems, item => item.sourceFilepath)
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
