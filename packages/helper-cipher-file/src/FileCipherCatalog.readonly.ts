import type {
  ICatalogItem,
  ICipherCatalogContext,
  IDeserializedCatalogItem,
  IDraftCatalogItem,
  IReadonlyCipherCatalog,
} from '@guanghechen/cipher-catalog.types'
import { calcFilePartItemsBySize, calcFilePartNames } from '@guanghechen/file-split'
import { isFileSync } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import { stat } from 'node:fs/promises'
import { calcFingerprintFromFile, calcFingerprintFromString } from './util/fingerprint'
import { normalizePlainFilepath } from './util/normalizePlainFilepath'

const clazz = 'ReadonlyFileCipherCatalog'

export abstract class ReadonlyFileCipherCatalog implements IReadonlyCipherCatalog {
  public readonly context: ICipherCatalogContext

  constructor(context: ICipherCatalogContext) {
    this.context = context
  }

  // @override
  public abstract readonly items: Iterable<ICatalogItem>

  // @override
  public async calcCatalogItem(plainFilepath: string): Promise<IDraftCatalogItem | never> {
    const title = `${clazz}.calcCatalogItem`
    const { context } = this
    const { contentHashAlgorithm, maxTargetFileSize, partCodePrefix, plainPathResolver } = context

    const absolutePlainFilepath = plainPathResolver.resolve(plainFilepath)
    invariant(isFileSync(absolutePlainFilepath), `[${title}] Not a file ${absolutePlainFilepath}.`)

    const fileSize = await stat(absolutePlainFilepath).then(md => md.size)
    const fingerprint = await calcFingerprintFromFile(absolutePlainFilepath, contentHashAlgorithm)
    const relativePlainFilepath = plainPathResolver.relative(absolutePlainFilepath)
    const keepPlain: boolean = context.isKeepPlain(relativePlainFilepath)

    const cryptFilepath: string = this.calcCryptFilepath(relativePlainFilepath)
    const cryptFilepathParts = calcFilePartNames(
      calcFilePartItemsBySize(fileSize, maxTargetFileSize),
      partCodePrefix,
    )

    return {
      plainFilepath: relativePlainFilepath,
      cryptFilepath,
      cryptFilepathParts: cryptFilepathParts.length > 1 ? cryptFilepathParts : [],
      fingerprint,
      keepPlain,
    }
  }

  // @override
  public calcCryptFilepath(plainFilepath: string): string {
    const { context } = this
    const { plainPathResolver } = context
    const relativePlainFilepath = plainPathResolver.relative(plainFilepath)
    if (context.isKeepPlain(relativePlainFilepath)) return relativePlainFilepath

    const { cryptFilepathSalt, cryptFilesDir, cryptPathResolver, pathHashAlgorithm } = context
    const plainFilepathKey: string = this.normalizePlainFilepath(relativePlainFilepath)
    const filepathHash: string = calcFingerprintFromString(
      cryptFilepathSalt + plainFilepathKey,
      'utf8',
      pathHashAlgorithm,
    )
    const cryptFilepath: string = cryptPathResolver.relative(cryptFilesDir + '/' + filepathHash)
    return cryptFilepath
  }

  // @override
  public async checkCryptIntegrity(cryptFilepaths: string[]): Promise<void> {
    const title = `${clazz}.checkCryptIntegrity`
    const { context, items } = this
    const { cryptPathResolver } = context
    const filepathSet: Set<string> = new Set(cryptFilepaths.map(p => cryptPathResolver.relative(p)))

    let count = 0
    for (const item of items) {
      if (item.cryptFilepathParts.length > 1) {
        for (const filePart of item.cryptFilepathParts) {
          const cryptFilepath = item.cryptFilepath + filePart
          const absoluteCryptFilepath = cryptPathResolver.resolve(cryptFilepath)
          count += 1

          invariant(
            filepathSet.has(cryptFilepath),
            `[${title}] Unexpected cryptFilepath. ${cryptFilepath}`,
          )
          invariant(
            isFileSync(absoluteCryptFilepath),
            `[${title}] Missing crypt file part. ${cryptFilepath})`,
          )
        }
      } else {
        const { cryptFilepath } = item
        const absoluteCryptFilepath = cryptPathResolver.resolve(cryptFilepath)
        count += 1

        invariant(
          filepathSet.has(cryptFilepath),
          `[${title}] Unexpected cryptFilepath. ${cryptFilepath}`,
        )
        invariant(
          isFileSync(absoluteCryptFilepath),
          `[${title}] Missing crypt file. ${cryptFilepath}`,
        )
      }
    }

    invariant(
      filepathSet.size === count,
      `[${title}] Count of crypt filepaths are not match. expect(${filepathSet.size}), received(${count})`,
    )
  }

  // @override
  public async checkPlainIntegrity(plainFilepaths: string[]): Promise<void> {
    const title = `${clazz}.checkPlainIntegrity`
    const { context, items } = this
    const { plainPathResolver } = context
    const filepathSet: Set<string> = new Set(plainFilepaths.map(p => plainPathResolver.relative(p)))

    let count = 0
    for (const item of items) {
      const { plainFilepath } = item
      const absolutePlainFilepath = plainPathResolver.resolve(plainFilepath)
      count += 1

      invariant(
        filepathSet.has(plainFilepath),
        `[${title}] Unexpected plainFilepath. ${plainFilepath}`,
      )
      invariant(
        isFileSync(absolutePlainFilepath),
        `[${title}] Missing plain file. (${plainFilepath})`,
      )
    }

    invariant(
      filepathSet.size === count,
      `[${title}] Count of plain filepaths are not match. expect(${filepathSet.size}), received(${count})`,
    )
  }

  // @override
  public async flatItem(item: IDeserializedCatalogItem): Promise<ICatalogItem> {
    const cryptFilepath: string = this.calcCryptFilepath(item.plainFilepath)
    const iv: Uint8Array | undefined = await this.getIv(item)
    return { ...item, cryptFilepath, iv }
  }

  // @override
  public async getIv(
    item: IDeserializedCatalogItem | IDraftCatalogItem,
  ): Promise<Uint8Array | undefined> {
    const { context } = this
    return context.getIv(item)
  }

  // @override
  public isKeepPlain(relativePlainFilepath: string): boolean {
    const { context } = this
    return context.isKeepPlain(relativePlainFilepath)
  }

  // @override
  public normalizePlainFilepath(plainFilepath: string): string {
    const { context } = this
    const { plainPathResolver } = context
    return normalizePlainFilepath(plainFilepath, plainPathResolver)
  }
}
