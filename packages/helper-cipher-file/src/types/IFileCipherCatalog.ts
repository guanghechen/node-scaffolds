import type { IFileCipherCatalogItem, IFileCipherCatalogItemDiff } from './IFileCipherCatalogItem'

export interface IFileCipherCatalog {
  /**
   * Get current catalog items.
   */
  items: Iterable<IFileCipherCatalogItem>

  /**
   * Clear the catalog items and init with the new given items.
   * @param items
   */
  reset(items?: Iterable<IFileCipherCatalogItem>): void

  /**
   * Check the file for corruption.
   */
  checkIntegrity(params: ICheckIntegrityParams): Promise<void | never>

  /**
   * Apply catalog diffs.
   * @param diffItems
   */
  applyDiff(diffItems: Iterable<IFileCipherCatalogItemDiff>): void

  /**
   * Generate a catalog item.
   */
  calcCatalogItem(params: ICalcCatalogItemParams): Promise<IFileCipherCatalogItem | never>

  /**
   * Calculate diff items with the new catalog items.
   */
  diffFromCatalogItems(params: IDiffFromCatalogItemsParams): IFileCipherCatalogItemDiff[]

  /**
   * Calculate diff items.
   */
  diffFromPlainFiles(params: IDiffFromPlainFiles): Promise<IFileCipherCatalogItemDiff[]>
}

export interface ICheckIntegrityParams {
  flags: {
    /**
     * Check integrity for plain files.
     */
    plainFiles?: boolean
    /**
     * Check integrity for encrypted files.
     */
    cryptFiles?: boolean
  }
}

export interface ICalcCatalogItemParams {
  plainFilepath: string
  /**
   * Determine if a plain file should be keep plain.
   * @param relativePlainFilepath relative plain filepath
   */
  isKeepPlain?(relativePlainFilepath: string): boolean
}

export interface IDiffFromCatalogItemsParams {
  newItems: Iterable<IFileCipherCatalogItem>
}

export interface IDiffFromPlainFiles {
  plainFilepaths: string[]
  /**
   * Check some edge cases that shouldn't affect the final result, just for higher integrity check.
   */
  strickCheck: boolean
  /**
   * Determine if a plain file should be keep plain.
   * @param relativePlainFilepath relative plain filepath
   */
  isKeepPlain?(relativePlainFilepath: string): boolean
}
