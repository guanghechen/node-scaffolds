import type { IFileCipherCatalogItem, IFileCipherCatalogItemDiff } from './IFileCipherCatalogItem'

export interface IFileCipherCatalog {
  /**
   * Get current catalog items.
   */
  currentItems: IFileCipherCatalogItem[]

  /**
   * Clear the catalog items.
   */
  clear(): void

  /**
   * Calculate diff items.
   */
  calcDiffItems(params: ICalcDiffItemsParams): Promise<IFileCipherCatalogItemDiff[]>

  /**
   * Check the file for corruption.
   */
  checkIntegrity(params: ICheckIntegrityParams): Promise<void | never>

  /**
   * Update the encrypted data based on the catalog items diff.
   */
  encryptDiff(params: IEncryptDiffParams): Promise<void>

  /**
   * Update the plain data based on the catalog items diff.
   */
  decryptDiff(params: IDecryptDiffParams): Promise<void>
}

export interface ICalcDiffItemsParams {
  sourceFilepaths: string[]
  /**
   * Check if a sourcefile should be keep plain.
   * @param relativeSourceFilepath Relative source filepath
   */
  isKeepPlain?(relativeSourceFilepath: string): boolean
}

export interface ICheckIntegrityParams {
  /**
   * Check integrity for source files.
   */
  sourceFiles?: boolean
  /**
   * Check integrity for encrypted files.
   */
  encryptedFiles?: boolean
}

export interface IEncryptDiffParams {
  diffItems: ReadonlyArray<IFileCipherCatalogItemDiff>
}

export interface IDecryptDiffParams {
  diffItems: ReadonlyArray<IFileCipherCatalogItemDiff>
}
