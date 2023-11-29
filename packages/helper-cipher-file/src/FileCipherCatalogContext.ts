import type { ICipherCatalogContext } from '@guanghechen/cipher-workspace.types'
import invariant from '@guanghechen/invariant'
import type { IHashAlgorithm } from '@guanghechen/mac'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import path from 'node:path'

export interface ICipherCatalogContextProps {
  readonly contentHashAlgorithm: IHashAlgorithm
  readonly cryptFilepathSalt: string
  readonly cryptFilesDir: string
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly maxTargetFileSize: number
  readonly partCodePrefix: string
  readonly pathHashAlgorithm: IHashAlgorithm
  readonly plainPathResolver: IWorkspacePathResolver
  isKeepPlain(relativePlainFilepath: string): boolean
}

const clazz = 'CipherCatalogContext'

export class CipherCatalogContext implements ICipherCatalogContext {
  public readonly contentHashAlgorithm: IHashAlgorithm
  public readonly cryptFilepathSalt: string
  public readonly cryptFilesDir: string
  public readonly cryptPathResolver: IWorkspacePathResolver
  public readonly maxTargetFileSize: number
  public readonly partCodePrefix: string
  public readonly pathHashAlgorithm: IHashAlgorithm
  public readonly plainPathResolver: IWorkspacePathResolver
  public readonly isKeepPlain: (relativePlainFilepath: string) => boolean

  constructor(props: ICipherCatalogContextProps) {
    const title: string = clazz
    invariant(
      !path.isAbsolute(props.cryptFilesDir),
      `[${title}] cryptFilesDir should be a relative path. received(${props.cryptFilesDir})`,
    )

    this.contentHashAlgorithm = props.contentHashAlgorithm
    this.cryptFilesDir = props.cryptFilesDir
    this.cryptFilepathSalt = props.cryptFilepathSalt
    this.cryptPathResolver = props.cryptPathResolver
    this.maxTargetFileSize = props.maxTargetFileSize
    this.partCodePrefix = props.partCodePrefix
    this.pathHashAlgorithm = props.pathHashAlgorithm
    this.plainPathResolver = props.plainPathResolver
    this.isKeepPlain = props.isKeepPlain
  }
}
