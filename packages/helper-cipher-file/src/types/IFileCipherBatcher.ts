import type {
  ICatalogDiffItem,
  IDeserializedCatalogItem,
  IDraftCatalogDiffItem,
  IDraftCatalogItem,
} from '@guanghechen/cipher-workspace.types'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'

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
  cryptPathResolver: IWorkspacePathResolver
  diffItems: Iterable<Readonly<IDraftCatalogDiffItem>>
  plainPathResolver: IWorkspacePathResolver
  strictCheck: boolean
  getIv(
    item: IDeserializedCatalogItem | IDraftCatalogItem,
  ): Promise<Readonly<Uint8Array> | undefined> | Readonly<Uint8Array> | undefined
}

export interface IBatchDecryptParams {
  cryptPathResolver: IWorkspacePathResolver
  diffItems: Iterable<Readonly<ICatalogDiffItem>>
  plainPathResolver: IWorkspacePathResolver
  strictCheck: boolean
}
