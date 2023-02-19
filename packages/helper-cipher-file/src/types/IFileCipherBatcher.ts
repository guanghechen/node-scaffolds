import type { FileCipherPathResolver } from '../FileCipherPathResolver'
import type {
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogDiffItemDraft,
} from './IFileCipherCatalogDiffItem'
import type { IFileCipherCatalogItemDraft } from './IFileCipherCatalogItem'

export interface IFileCipherBatcher {
  /**
   * Update the encrypted data based on the catalog items diff.
   */
  batchEncrypt(params: IBatchEncryptParams): Promise<IFileCipherCatalogDiffItem[]>

  /**
   * Update the plain data based on the catalog items diff.
   */
  batchDecrypt(params: IBatchDecryptParams): Promise<void>
}

export interface IBatchEncryptParams {
  strictCheck: boolean
  pathResolver: FileCipherPathResolver
  diffItems: Iterable<Readonly<IFileCipherCatalogDiffItemDraft>>
  getIv(item: IFileCipherCatalogItemDraft): Promise<Buffer | undefined> | Buffer | undefined
}

export interface IBatchDecryptParams {
  strictCheck: boolean
  pathResolver: FileCipherPathResolver
  diffItems: Iterable<Readonly<IFileCipherCatalogDiffItem>>
}
