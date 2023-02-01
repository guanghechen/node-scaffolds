import type { IFileCipherCatalogItemDiff } from './IFileCipherCatalogItem'

export interface IFileCipherBatcher {
  /**
   * Update the encrypted data based on the catalog items diff.
   */
  batchEncrypt(params: IBatchEncryptParams): Promise<void>

  /**
   * Update the plain data based on the catalog items diff.
   */
  batchDecrypt(params: IBatchDecryptParams): Promise<void>
}

export interface IBatchEncryptParams {
  strictCheck: boolean
  diffItems: Iterable<IFileCipherCatalogItemDiff>
}

export interface IBatchDecryptParams {
  strictCheck: boolean
  diffItems: Iterable<IFileCipherCatalogItemDiff>
}
