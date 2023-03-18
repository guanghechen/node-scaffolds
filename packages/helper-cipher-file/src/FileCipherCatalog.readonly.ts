import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import path from 'node:path'
import { calcCatalogItem } from './catalog/calcCatalogItem'
import { calcCryptFilepath } from './catalog/calcCryptFilepath'
import { checkCryptIntegrity } from './catalog/checkCryptIntegrity'
import { checkPlainIntegrity } from './catalog/checkPlainIntegrity'
import type {
  ICatalogCalcCatalogItemParams,
  ICatalogCalcCryptFilepathParams,
  ICatalogCheckCryptIntegrityParams,
  ICatalogCheckPlainIntegrityParams,
  IReadonlyFileCipherCatalog,
} from './types/IFileCipherCatalog'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDraft,
} from './types/IFileCipherCatalogItem'

export interface IReadonlyFileCipherCatalogProps {
  contentHashAlgorithm: IHashAlgorithm
  cryptFilepathSalt: string
  cryptFilesDir: string
  maxTargetFileSize: number
  partCodePrefix: string
  pathHashAlgorithm: IHashAlgorithm
  plainPathResolver: FilepathResolver
  isKeepPlain(relativePlainFilepath: string): boolean
}

export abstract class ReadonlyFileCipherCatalog implements IReadonlyFileCipherCatalog {
  public readonly plainPathResolver: FilepathResolver
  public readonly maxTargetFileSize: number
  public readonly partCodePrefix: string
  public readonly cryptFilesDir: string
  public readonly cryptFilepathSalt: string
  public readonly contentHashAlgorithm: IHashAlgorithm
  public readonly pathHashAlgorithm: IHashAlgorithm
  protected readonly isKeepPlain: (relativePlainFilepath: string) => boolean

  constructor(props: IReadonlyFileCipherCatalogProps) {
    invariant(
      !path.isAbsolute(props.cryptFilesDir),
      `[ReadonlyFileCipherCatalog.constructor] cryptFilesDir should be a relative path. received(${props.cryptFilesDir})`,
    )

    this.plainPathResolver = props.plainPathResolver
    this.maxTargetFileSize = props.maxTargetFileSize
    this.partCodePrefix = props.partCodePrefix
    this.cryptFilesDir = props.cryptFilesDir
    this.cryptFilepathSalt = props.cryptFilepathSalt
    this.contentHashAlgorithm = props.contentHashAlgorithm
    this.pathHashAlgorithm = props.pathHashAlgorithm
    this.isKeepPlain = props.isKeepPlain
  }

  // @override
  public abstract get items(): Iterable<IFileCipherCatalogItem>

  // @override
  public async calcCatalogItem(
    params: ICatalogCalcCatalogItemParams,
  ): Promise<IFileCipherCatalogItemDraft | never> {
    return calcCatalogItem({
      contentHashAlgorithm: this.contentHashAlgorithm,
      cryptFilepathSalt: this.cryptFilepathSalt,
      cryptFilesDir: this.cryptFilesDir,
      maxTargetFileSize: this.maxTargetFileSize,
      partCodePrefix: this.partCodePrefix,
      pathHashAlgorithm: this.pathHashAlgorithm,
      plainFilepath: params.plainFilepath,
      plainPathResolver: this.plainPathResolver,
      isKeepPlain: params.isKeepPlain ?? this.isKeepPlain,
    })
  }

  // override
  public calcCryptFilepath(params: ICatalogCalcCryptFilepathParams): string {
    return calcCryptFilepath({
      cryptFilesDir: this.cryptFilesDir,
      cryptFilepathSalt: this.cryptFilepathSalt,
      keepPlain: params.keepPlain,
      pathHashAlgorithm: this.pathHashAlgorithm,
      plainFilepath: params.plainFilepath,
      plainPathResolver: this.plainPathResolver,
    })
  }

  // @override
  public async checkPlainIntegrity(params: ICatalogCheckPlainIntegrityParams): Promise<void> {
    checkPlainIntegrity({
      items: this.items,
      plainFilepaths: params.plainFilepaths,
      plainPathResolver: this.plainPathResolver,
    })
  }

  // @override
  public async checkCryptIntegrity(params: ICatalogCheckCryptIntegrityParams): Promise<void> {
    checkCryptIntegrity({
      items: this.items,
      cryptFilepaths: params.cryptFilepaths,
      cryptPathResolver: params.cryptPathResolver,
    })
  }
}
