import type { FilepathResolver } from '@guanghechen/helper-path'
import type {
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogDiffItemDraft,
} from './IFileCipherCatalogDiffItem'
import type { IFileCipherCatalogItem, IFileCipherCatalogItemDraft } from './IFileCipherCatalogItem'

export interface IReadonlyFileCipherCatalog {
  /**
   * Generate a catalog item.
   */
  calcCatalogItem(
    params: ICatalogCalcCatalogItemParams,
  ): Promise<IFileCipherCatalogItemDraft | never>

  /**
   * Calc crypt filepath.
   */
  calcCryptFilepath(params: ICatalogCalcCryptFilepathParams): string

  /**
   * Check crypt files for corruption.
   */
  checkCryptIntegrity(params: ICatalogCheckCryptIntegrityParams): Promise<void | never>

  /**
   * Check plain files for corruption.
   */
  checkPlainIntegrity(params: ICatalogCheckPlainIntegrityParams): Promise<void | never>
}

export interface IFileCipherCatalog extends IReadonlyFileCipherCatalog {
  /**
   * Get current catalog items.
   */
  items: Iterable<IFileCipherCatalogItem>

  /**
   * Apply catalog diffs.
   */
  applyDiff(diffItems: Iterable<IFileCipherCatalogDiffItem>): void

  /**
   * Clear the catalog items and init with the new given items.
   */
  reset(items?: Iterable<IFileCipherCatalogItem>): void

  /**
   * Calculate diff items with the new catalog items.
   */
  diffFromCatalogItems(params: ICatalogDiffFromCatalogItemsParams): IFileCipherCatalogDiffItem[]

  /**
   * Calculate diff items.
   */
  diffFromPlainFiles(params: ICatalogDiffFromPlainFiles): Promise<IFileCipherCatalogDiffItemDraft[]>
}

export interface ICatalogCheckCryptIntegrityParams {
  cryptPathResolver: FilepathResolver
  cryptFilepaths: string[]
}

export interface ICatalogCheckPlainIntegrityParams {
  plainFilepaths: string[]
}

export interface ICatalogCalcCatalogItemParams {
  plainFilepath: string
  /**
   * Determine if a plain file should be keep plain.
   * @param relativePlainFilepath relative plain filepath
   */
  isKeepPlain?(relativePlainFilepath: string): boolean
}

export interface ICatalogCalcCryptFilepathParams {
  keepPlain: boolean
  plainFilepath: string
}

export interface ICatalogDiffFromCatalogItemsParams {
  newItems: Iterable<IFileCipherCatalogItem>
}

export interface ICatalogDiffFromPlainFiles {
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
