import type { ICipherCatalogContext } from './context'
import type { ICatalogItem, IDeserializedCatalogItem, IDraftCatalogItem } from './item'

export interface IReadonlyCipherCatalog {
  /**
   * Get current catalog context.
   */
  readonly context: ICipherCatalogContext

  /**
   * Get current catalog items.
   */
  readonly items: Iterable<ICatalogItem>

  /**
   * Generate a catalog item.
   * @param plainFilepath
   */
  calcCatalogItem(plainFilepath: string): Promise<IDraftCatalogItem | never>

  /**
   * Calc crypt filepath.
   * @param plainFilepath
   */
  calcCryptFilepath(plainFilepath: string): string

  /**
   * Check crypt files for corruption.
   * @param cryptFilepaths
   */
  checkCryptIntegrity(cryptFilepaths: string[]): Promise<void | never>

  /**
   * Check plain files for corruption.
   * @param plainFilepaths
   */
  checkPlainIntegrity(plainFilepaths: string[]): Promise<void | never>

  /**
   * Flat the deserialized catalog item.
   * @param item
   */
  flatItem(item: IDeserializedCatalogItem): Promise<ICatalogItem>

  /**
   * Get the iv of the given item.
   * @param item
   */
  getIv(item: IDeserializedCatalogItem | IDraftCatalogItem): Promise<Uint8Array | undefined>

  /**
   * Check if the content in the given relativePlainFilepath should be kept plain.
   * @param relativePlainFilepath
   */
  isKeepPlain(relativePlainFilepath: string): boolean

  /**
   * Normalize the given plainFilepath to get a stable string across platforms.
   * @param plainFilepath
   */
  normalizePlainFilepath(plainFilepath: string): string
}
