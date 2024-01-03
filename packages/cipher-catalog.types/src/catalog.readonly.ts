import type { ICipherCatalogContext } from './context'
import type { ICatalogDiffItem, IDraftCatalogDiffItem } from './diff-item'
import type { ICatalogItem, IDeserializedCatalogItem, IDraftCatalogItem } from './item'

/**
 * !!! All plainPath and cryptPath should be relative path and use '/' as path separator.
 * The plainPath should be a relative path based on the plain folder.
 * The cryptPath should be a relative path based on the crypt folder.
 */
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
   * @param plainPath
   */
  calcCatalogItem(plainPath: string): Promise<IDraftCatalogItem | never>

  /**
   * Calc crypt filepath.
   * @param plainPath
   */
  calcCryptPath(plainPath: string): Promise<string>

  /**
   * Check crypt files for corruption.
   * @param allCryptPaths
   * @param returnImmediatelyOnError
   */
  checkCryptIntegrity(
    allCryptPaths: ReadonlySet<string>,
    returnImmediatelyOnError: boolean,
  ): Promise<string[]>

  /**
   * Check if any plain files are corrupted.
   * @param allPlainPaths
   * @param returnImmediatelyOnError
   */
  checkPlainIntegrity(
    allPlainPaths: ReadonlySet<string>,
    returnImmediatelyOnError: boolean,
  ): Promise<string[]>

  /**
   * Calculate diff items with the new catalog items.
   * @param newItems
   */
  diffFromCatalogItems(newItems: Iterable<ICatalogItem>): ICatalogDiffItem[]

  /**
   * Calculate diff items.
   * @param plainPaths
   * @param strickCheck     Wether if to check some edge cases that shouldn't affect the final result,
   *                        just for higher integrity check.
   */
  diffFromPlainFiles(plainPaths: string[], strickCheck: boolean): Promise<IDraftCatalogDiffItem[]>

  /**
   * Find a catalog item which matched the given filter.
   * @param filter
   */
  find(filter: (item: ICatalogItem) => boolean): ICatalogItem | undefined

  /**
   * Flat the deserialized catalog item.
   * @param item
   */
  flatItem(item: IDeserializedCatalogItem): Promise<ICatalogItem>

  /**
   * Get the catalog item by plain filepath.
   * @param plainPath
   */
  get(plainPath: string): ICatalogItem | undefined

  /**
   * Check if the given plain filepath is existed in the catalog.
   * @param plainPath
   */
  has(plainPath: string): boolean
}
