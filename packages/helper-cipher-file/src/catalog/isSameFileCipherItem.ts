import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDraft,
} from '../types/IFileCipherCatalogItem'

export function isSameFileCipherItemDraft(
  oldItem: Readonly<IFileCipherCatalogItemDraft>,
  newItem: Readonly<IFileCipherCatalogItemDraft>,
): boolean {
  if (oldItem === newItem) return true
  return (
    oldItem.plainFilepath === newItem.plainFilepath &&
    oldItem.cryptFilepath === newItem.cryptFilepath &&
    oldItem.fingerprint === newItem.fingerprint &&
    oldItem.keepPlain === newItem.keepPlain &&
    oldItem.cryptFilepathParts.length === newItem.cryptFilepathParts.length &&
    oldItem.cryptFilepathParts.every(part => newItem.cryptFilepathParts.includes(part))
  )
}

export function isSameFileCipherItem(
  oldItem: Readonly<IFileCipherCatalogItem>,
  newItem: Readonly<IFileCipherCatalogItem>,
): boolean {
  if (oldItem === newItem) return true
  return (
    isSameFileCipherItemDraft(oldItem, newItem) &&
    oldItem.iv === newItem.iv &&
    oldItem.authTag === newItem.authTag
  )
}
