import { text2bytes } from '@guanghechen/byte'
import type {
  ICipherCatalogContext,
  IDeserializedCatalogItem,
  IDraftCatalogItem,
} from '@guanghechen/cipher-workspace.types'
import type { IHashAlgorithm } from '@guanghechen/mac'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'

export interface ICipherCatalogContextProps {
  readonly contentHashAlgorithm: IHashAlgorithm
  readonly cryptFilepathSalt: string
  readonly cryptFilesDir: string
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly maxTargetFileSize: number
  readonly partCodePrefix: string
  readonly pathHashAlgorithm: IHashAlgorithm
  readonly plainPathResolver: IWorkspacePathResolver
  readonly calcIv: (infos: ReadonlyArray<Uint8Array>) => Readonly<Uint8Array>
  readonly isKeepPlain: (relativePlainFilepath: string) => boolean
}

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
  protected readonly _calcIv: (infos: ReadonlyArray<Uint8Array>) => Readonly<Uint8Array>

  constructor(props: ICipherCatalogContextProps) {
    const {
      contentHashAlgorithm,
      cryptFilepathSalt,
      maxTargetFileSize,
      partCodePrefix,
      pathHashAlgorithm,
      isKeepPlain,
      calcIv,
    } = props
    const { cryptPathResolver, plainPathResolver } = props
    const cryptFilesDir = cryptPathResolver.relative(props.cryptFilesDir)

    this.contentHashAlgorithm = contentHashAlgorithm
    this.cryptFilesDir = cryptFilesDir
    this.cryptFilepathSalt = cryptFilepathSalt
    this.cryptPathResolver = cryptPathResolver
    this.maxTargetFileSize = maxTargetFileSize
    this.partCodePrefix = partCodePrefix
    this.pathHashAlgorithm = pathHashAlgorithm
    this.plainPathResolver = plainPathResolver
    this.isKeepPlain = isKeepPlain
    this._calcIv = calcIv
  }

  public getIv(item: IDeserializedCatalogItem | IDraftCatalogItem): Readonly<Uint8Array> {
    return this._calcIv([
      text2bytes(item.plainFilepath, 'utf8'),
      text2bytes(item.fingerprint, 'hex'),
    ])
  }
}
