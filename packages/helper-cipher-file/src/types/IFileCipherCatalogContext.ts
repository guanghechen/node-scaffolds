import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'

export interface IFileCipherCatalogContext {
  readonly contentHashAlgorithm: IHashAlgorithm
  readonly cryptFilepathSalt: string
  readonly cryptFilesDir: string
  readonly maxTargetFileSize: number
  readonly partCodePrefix: string
  readonly pathHashAlgorithm: IHashAlgorithm
  readonly plainPathResolver: IWorkspacePathResolver
  readonly cryptPathResolver: IWorkspacePathResolver
  isKeepPlain(relativePlainFilepath: string): boolean
}
