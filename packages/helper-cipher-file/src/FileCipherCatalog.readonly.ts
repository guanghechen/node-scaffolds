import type { Logger } from '@guanghechen/chalk-logger'
import { calcFilePartItemsBySize, calcFilePartNames } from '@guanghechen/helper-file'
import { isFileSync } from '@guanghechen/helper-fs'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import fs from 'node:fs/promises'
import path from 'node:path'
import type {
  ICalcCatalogItemParams,
  ICalcCryptFilepathParams,
  ICheckCryptIntegrityParams,
  IReadonlyFileCipherCatalog,
} from './types/IFileCipherCatalog'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDraft,
} from './types/IFileCipherCatalogItem'
import { normalizePlainFilepath } from './util/catalog'
import { calcFingerprintFromFile, calcFingerprintFromString } from './util/mac'

export interface IReadonlyFileCipherCatalogProps {
  contentHashAlgorithm: IHashAlgorithm
  cryptFilepathSalt: string
  cryptFilesDir: string
  logger: Logger | undefined
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
  protected readonly logger: Logger | undefined
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
    this.logger = props.logger
    this.isKeepPlain = props.isKeepPlain
  }

  // @override
  public abstract get items(): Iterable<IFileCipherCatalogItem>

  // @override
  public async calcCatalogItem(
    params: ICalcCatalogItemParams,
  ): Promise<IFileCipherCatalogItemDraft | never> {
    const { isKeepPlain = this.isKeepPlain } = params
    const { contentHashAlgorithm, plainPathResolver } = this
    const absolutePlainFilepath = plainPathResolver.absolute(params.plainFilepath)
    invariant(isFileSync(absolutePlainFilepath), `Not a file ${absolutePlainFilepath}.`)

    const fileSize = await fs.stat(absolutePlainFilepath).then(md => md.size)
    const fingerprint = await calcFingerprintFromFile(absolutePlainFilepath, contentHashAlgorithm)
    const relativePlainFilepath = plainPathResolver.relative(absolutePlainFilepath)
    const keepPlain: boolean = isKeepPlain(relativePlainFilepath)

    const cryptFilepath: string = this.calcCryptFilepath({
      plainFilepath: relativePlainFilepath,
      keepPlain,
    })
    const cryptFilepathParts = calcFilePartNames(
      calcFilePartItemsBySize(fileSize, this.maxTargetFileSize),
      this.partCodePrefix,
    )

    return {
      plainFilepath: relativePlainFilepath,
      cryptFilepath,
      cryptFilepathParts: cryptFilepathParts.length > 1 ? cryptFilepathParts : [],
      fingerprint,
      keepPlain,
    }
  }

  // override
  public calcCryptFilepath(params: ICalcCryptFilepathParams): string {
    const { keepPlain } = params
    const { cryptFilesDir, cryptFilepathSalt, plainPathResolver } = this
    const absolutePlainFilepath = plainPathResolver.absolute(params.plainFilepath)
    const relativePlainFilepath = plainPathResolver.relative(absolutePlainFilepath)
    const plainFilepathKey = normalizePlainFilepath(relativePlainFilepath, plainPathResolver)
    const cryptFilepath: string = keepPlain
      ? relativePlainFilepath
      : path.join(
          cryptFilesDir,
          calcFingerprintFromString(
            cryptFilepathSalt + plainFilepathKey,
            'utf8',
            this.pathHashAlgorithm,
          ),
        )
    return cryptFilepath
  }

  // @override
  public async checkPlainIntegrity(): Promise<void | never> {
    const { logger, plainPathResolver } = this
    logger?.debug('[checkPlainIntegrity] checking plain files.')
    for (const item of this.items) {
      const absolutePlainFilepath = plainPathResolver.absolute(item.plainFilepath)
      invariant(
        isFileSync(absolutePlainFilepath),
        `[checkPlainIntegrity] Missing plain file. (${absolutePlainFilepath})`,
      )
    }
  }

  // @override
  public async checkCryptIntegrity({
    cryptPathResolver,
  }: ICheckCryptIntegrityParams): Promise<void | never> {
    const { logger } = this
    logger?.debug('[checkCryptIntegrity] checking crypt files.')
    for (const item of this.items) {
      if (item.cryptFilepathParts.length > 1) {
        for (const filePart of item.cryptFilepathParts) {
          const cryptFilepath = item.cryptFilepath + filePart
          const absoluteCryptFilepath = cryptPathResolver.absolute(cryptFilepath)
          invariant(
            isFileSync(absoluteCryptFilepath),
            `[checkCryptIntegrity] Missing crypt file part. (${absoluteCryptFilepath})`,
          )
        }
      } else {
        const absoluteCryptFilepath = cryptPathResolver.absolute(item.cryptFilepath)
        invariant(
          isFileSync(absoluteCryptFilepath),
          `[checkCryptIntegrity] Missing crypt file. (${absoluteCryptFilepath})`,
        )
      }
    }
  }
}
