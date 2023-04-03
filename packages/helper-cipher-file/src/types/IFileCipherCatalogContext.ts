import type { IHashAlgorithm } from '@guanghechen/helper-mac'

export interface IFileCipherCatalogContext {
  readonly contentHashAlgorithm: IHashAlgorithm
  readonly cryptFilepathSalt: string
  readonly cryptFilesDir: string
  readonly maxTargetFileSize: number
  readonly partCodePrefix: string
  readonly pathHashAlgorithm: IHashAlgorithm
  isKeepPlain(relativePlainFilepath: string): boolean
}
