import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import type { IDeserializedCatalogItem, IDraftCatalogItem } from './item'

export type IHashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512'

export interface ICipherCatalogContext {
  readonly contentHashAlgorithm: IHashAlgorithm
  readonly cryptFilepathSalt: string
  readonly cryptFilesDir: string
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly maxTargetFileSize: number
  readonly partCodePrefix: string
  readonly pathHashAlgorithm: IHashAlgorithm
  readonly plainPathResolver: IWorkspacePathResolver

  /**
   * Get the iv of the given item.
   * @param item
   */
  getIv(item: IDeserializedCatalogItem | IDraftCatalogItem): Promise<Uint8Array | undefined>

  /**
   * Check if the plain file should be kept plain.
   * @param relativePlainFilepath
   */
  isKeepPlain(relativePlainFilepath: string): boolean
}
