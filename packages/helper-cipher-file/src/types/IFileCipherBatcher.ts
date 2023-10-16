import type { IWorkspacePathResolver } from '@guanghechen/path.types'
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
  cryptPathResolver: IWorkspacePathResolver
  diffItems: Iterable<Readonly<IFileCipherCatalogDiffItemDraft>>
  plainPathResolver: IWorkspacePathResolver
  strictCheck: boolean
  getIv(item: IFileCipherCatalogItemDraft): Promise<Buffer | undefined> | Buffer | undefined
}

export interface IBatchDecryptParams {
  cryptPathResolver: IWorkspacePathResolver
  diffItems: Iterable<Readonly<IFileCipherCatalogDiffItem>>
  plainPathResolver: IWorkspacePathResolver
  strictCheck: boolean
}
