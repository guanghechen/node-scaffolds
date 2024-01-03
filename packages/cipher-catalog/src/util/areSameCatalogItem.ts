import { areSameBytes } from '@guanghechen/byte'
import type { ICatalogItem } from '@guanghechen/cipher-catalog.types'
import { areSameDraftCatalogItem } from './areSameDraftCatalogItem'

export function areSameCatalogItem(
  oldItem: Readonly<ICatalogItem>,
  newItem: Readonly<ICatalogItem>,
): boolean {
  if (oldItem === newItem) return true
  return areSameDraftCatalogItem(oldItem, newItem) && areSameBytes(oldItem.authTag, newItem.authTag)
}
