import type { IDraftCatalogItem } from './draft'

export * from './deserialized'
export * from './draft'
export * from './serialized'

export interface ICatalogItem extends IDraftCatalogItem {
  /**
   * Authenticate tag.
   */
  authTag: Readonly<Uint8Array> | undefined
}
