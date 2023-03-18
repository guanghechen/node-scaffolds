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

export interface IReadonlyFileCipherCatalog {
  /**
   * Generate a catalog item.
   */
  calcCatalogItem(params: ICalcCatalogItemParams): Promise<IFileCipherCatalogItemDraft | never>

  /**
   * Calc crypt filepath.
   */
  calcCryptFilepath(params: ICalcCryptFilepathParams): string

  /**
   * Check crypt files for corruption.
   */
  checkCryptIntegrity(params: ICheckCryptIntegrityParams): Promise<void | never>

  /**
   * Check plain files for corruption.
   */
  checkPlainIntegrity(): Promise<void | never>
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
