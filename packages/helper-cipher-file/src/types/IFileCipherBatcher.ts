import type {
  ICatalogDiffItem,
  ICipherCatalog,
  IDraftCatalogDiffItem,
} from '@guanghechen/cipher-catalog.types'

export interface IFileCipherBatcher {
  /**
   * Update the encrypted data based on the catalog items diff.
   */
  batchEncrypt(params: IBatchEncryptParams): Promise<ICatalogDiffItem[]>

  /**
   * Update the plain data based on the catalog items diff.
   */
  batchDecrypt(params: IBatchDecryptParams): Promise<void>
}

export interface IBatchEncryptParams {
  readonly catalog: ICipherCatalog
  readonly diffItems: Iterable<Readonly<IDraftCatalogDiffItem>>
  readonly strictCheck: boolean
}

export interface IBatchDecryptParams {
  readonly catalog: ICipherCatalog
  readonly diffItems: Iterable<Readonly<ICatalogDiffItem>>
  readonly strictCheck: boolean
}
