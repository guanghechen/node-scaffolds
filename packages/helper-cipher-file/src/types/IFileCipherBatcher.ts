import type {
  ICatalogDiffItem,
  ICatalogItem,
  IDraftCatalogDiffItem,
  IDraftCatalogItem,
} from '@guanghechen/cipher-catalog.types'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'

export interface IFileCipherBatcher {
  /**
   * Encrypt given items.
   */
  batchEncrypt(params: IBatchEncryptParams): Promise<ICatalogItem[]>

  /**
   * Encrypt given diff items and remove crypt files followed by the changeType.
   * @param params
   */
  batchEncryptByDiffItems(params: IBatchEncryptByDiffItemsParams): Promise<ICatalogItem[]>

  /**
   * Decrypt given items.
   */
  batchDecrypt(params: IBatchDecryptParams): Promise<void>

  /**
   * Decrypt given diff items and remove plain files followed by the changeType.
   * @param params
   */
  batchDecryptByDiffItems(params: IBatchDecryptByDiffItemsParams): Promise<void>
}

export interface IBatchEncryptParams {
  readonly draftItems: Iterable<Readonly<IDraftCatalogItem>>
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
}

export interface IBatchEncryptByDiffItemsParams {
  readonly diffItems: Iterable<Readonly<IDraftCatalogDiffItem>>
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
}

export interface IBatchDecryptParams {
  readonly items: Iterable<Readonly<ICatalogItem>>
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
}

export interface IBatchDecryptByDiffItemsParams {
  readonly diffItems: Iterable<Readonly<ICatalogDiffItem>>
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
}
