import type { ICatalogItem } from '@guanghechen/cipher-catalog.types'
import { isSameFileCipherItemDraft } from './isSameFileCipherItemDraft'

export function isSameFileCipherItem(
  oldItem: Readonly<ICatalogItem>,
  newItem: Readonly<ICatalogItem>,
): boolean {
  if (oldItem === newItem) return true
  return (
    isSameFileCipherItemDraft(oldItem, newItem) &&
    oldItem.iv === newItem.iv &&
    oldItem.authTag === newItem.authTag
  )
}
