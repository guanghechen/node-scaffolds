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
  diffFromSourceFiles(params: IDiffFromSourceFiles): Promise<IFileCipherCatalogItemDiff[]>
}

export interface ICheckIntegrityParams {
  flags: {
    /**
     * Check integrity for source files.
     */
    sourceFiles?: boolean
    /**
     * Check integrity for encrypted files.
     */
    encryptedFiles?: boolean
  }
}

export interface ICalcCatalogItemParams {
  sourceFilepath: string
  /**
   * Check if a sourcefile should be keep plain.
   * @param relativeSourceFilepath Relative source filepath
   */
  isKeepPlain?(relativeSourceFilepath: string): boolean
}

export interface IDiffFromCatalogItemsParams {
  newItems: Iterable<IFileCipherCatalogItem>
}

export interface IDiffFromSourceFiles {
  sourceFilepaths: string[]
  /**
   * Check if a sourcefile should be keep plain.
   * @param relativeSourceFilepath Relative source filepath
   */
  isKeepPlain?(relativeSourceFilepath: string): boolean
}
