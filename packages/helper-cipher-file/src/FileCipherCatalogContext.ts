import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import invariant from '@guanghechen/invariant'
import path from 'node:path'
import type { IFileCipherCatalogContext } from './types/IFileCipherCatalogContext'

export interface IFileCipherCatalogContextProps {
  readonly contentHashAlgorithm: IHashAlgorithm
  readonly cryptFilepathSalt: string
  readonly cryptFilesDir: string
  readonly maxTargetFileSize: number
  readonly partCodePrefix: string
  readonly pathHashAlgorithm: IHashAlgorithm
  isKeepPlain(relativePlainFilepath: string): boolean
}

export class FileCipherCatalogContext implements IFileCipherCatalogContext {
  public readonly contentHashAlgorithm: IHashAlgorithm
  public readonly cryptFilepathSalt: string
  public readonly cryptFilesDir: string
  public readonly maxTargetFileSize: number
  public readonly partCodePrefix: string
  public readonly pathHashAlgorithm: IHashAlgorithm
  public readonly isKeepPlain: (relativePlainFilepath: string) => boolean

  constructor(props: IFileCipherCatalogContextProps) {
    invariant(
      !path.isAbsolute(props.cryptFilesDir),
      `[ReadonlyFileCipherCatalog.constructor] cryptFilesDir should be a relative path. received(${props.cryptFilesDir})`,
    )

    this.contentHashAlgorithm = props.contentHashAlgorithm
    this.cryptFilesDir = props.cryptFilesDir
    this.cryptFilepathSalt = props.cryptFilepathSalt
    this.maxTargetFileSize = props.maxTargetFileSize
    this.partCodePrefix = props.partCodePrefix
    this.pathHashAlgorithm = props.pathHashAlgorithm
    this.isKeepPlain = props.isKeepPlain
  }
}
