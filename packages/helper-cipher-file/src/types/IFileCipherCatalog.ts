import type { FilepathResolver } from '@guanghechen/helper-path'
import type {
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogDiffItemDraft,
} from './IFileCipherCatalogDiffItem'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemBase,
  IFileCipherCatalogItemDraft,
} from './IFileCipherCatalogItem'

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
   * Check plain files for corruption.
   */
  checkPlainIntegrity(): Promise<void | never>

  /**
   * Check crypt files for corruption.
   */
  checkCryptIntegrity(params: ICheckCryptIntegrityParams): Promise<void | never>

  /**
   * Apply catalog diffs.
   * @param diffItems
   */
  applyDiff(diffItems: Iterable<IFileCipherCatalogDiffItem>): void

  /**
   * Generate a catalog item.
   */
  calcCatalogItem(params: ICalcCatalogItemParams): Promise<IFileCipherCatalogItemDraft | never>

  /**
   * Calc crypt filepath.
   * @param params
   */
  calcCryptFilepath(params: ICalcCryptFilepathParams): string

  /**
   * Calculate diff items with the new catalog items.
   */
  diffFromCatalogItems(params: IDiffFromCatalogItemsParams): IFileCipherCatalogDiffItem[]

  /**
   * Calculate diff items.
   */
  diffFromPlainFiles(params: IDiffFromPlainFiles): Promise<IFileCipherCatalogDiffItemDraft[]>
}

export interface ICheckCryptIntegrityParams {
  cryptPathResolver: FilepathResolver
}

export interface ICalcCatalogItemParams {
  plainFilepath: string
  /**
   * Determine if a plain file should be keep plain.
   * @param relativePlainFilepath relative plain filepath
   */
  isKeepPlain?(relativePlainFilepath: string): boolean
}

export type ICalcCryptFilepathParams = Pick<
  IFileCipherCatalogItemBase,
  'plainFilepath' | 'keepPlain'
>

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
