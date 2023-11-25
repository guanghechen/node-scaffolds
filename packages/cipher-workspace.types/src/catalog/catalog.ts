import type { ICipherCatalogContext } from './context'
import { ICatalogDiffItem, IDraftCatalogDiffItem } from './diff-item'
import { ICatalogItem, IDraftCatalogItem } from './item'

export interface IReadonlyCipherCatalog {
  readonly context: ICipherCatalogContext

  /**
   * Generate a catalog item.
   */
  calcCatalogItem(plainFilepath: string): Promise<IDraftCatalogItem | never>

  /**
   * Calc crypt filepath.
   */
  calcCryptFilepath(plainFilepath: string): string

  /**
   * Check crypt files for corruption.
   */
  checkCryptIntegrity(plainFilepaths: string[]): Promise<void | never>

  /**
   * Check plain files for corruption.
   */
  checkPlainIntegrity(cryptFilepaths: string[]): Promise<void | never>
}

export interface ICipherCatalog extends IReadonlyCipherCatalog {
  /**
   * Get current catalog items.
   */
  readonly items: Iterable<ICatalogItem>

  /**
   * Apply catalog diffs.
   */
  applyDiff(diffItems: Iterable<ICatalogDiffItem>): void

  /**
   * Clear the catalog items and init with the new given items.
   */
  reset(items?: Iterable<ICatalogItem>): void

  /**
   * Calculate diff items with the new catalog items.
   */
  diffFromCatalogItems(newItems: Iterable<ICatalogItem>): ICatalogDiffItem[]

  /**
   * Calculate diff items.
   * @param plainFilepaths
   * @param strickCheck     Wether if to check some edge cases that shouldn't affect the final result,
   *                        just for higher integrity check.
   */
  diffFromPlainFiles(
    plainFilepaths: string[],
    strickCheck: boolean,
  ): Promise<IDraftCatalogDiffItem[]>
}
