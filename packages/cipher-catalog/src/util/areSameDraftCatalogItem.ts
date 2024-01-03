import { areSameBytes } from '@guanghechen/byte'
import type { IDraftCatalogItem } from '@guanghechen/cipher-catalog.types'

export function areSameDraftCatalogItem(
  oldItem: Readonly<IDraftCatalogItem>,
  newItem: Readonly<IDraftCatalogItem>,
): boolean {
  if (oldItem === newItem) return true
  return (
    oldItem.plainPath === newItem.plainPath &&
    oldItem.fingerprint === newItem.fingerprint &&
    oldItem.size === newItem.size &&
    oldItem.ctime === newItem.ctime &&
    oldItem.mtime === newItem.mtime &&
    oldItem.cryptPath === newItem.cryptPath &&
    oldItem.keepIntegrity === newItem.keepIntegrity &&
    oldItem.keepPlain === newItem.keepPlain &&
    oldItem.cryptPath.length === newItem.cryptPath.length &&
    oldItem.cryptPathParts.every(part => newItem.cryptPathParts.includes(part)) &&
    areSameBytes(oldItem.nonce, newItem.nonce)
  )
}
