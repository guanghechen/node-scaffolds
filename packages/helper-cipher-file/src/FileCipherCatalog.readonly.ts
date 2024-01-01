import { normalizePlainPath } from '@guanghechen/cipher-catalog'
import type {
  ICatalogItem,
  ICipherCatalogContext,
  ICipherCatalogMonitor,
  IDeserializedCatalogItem,
  IDraftCatalogItem,
  IReadonlyCipherCatalog,
  IUnMonitorCipherCatalog,
} from '@guanghechen/cipher-catalog'
import { calcFilePartItemsBySize, calcFilePartNames } from '@guanghechen/filepart'
import { isFileSync } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import { stat } from 'node:fs/promises'
import { calcFingerprintFromFile, calcFingerprintFromString } from './util/fingerprint'

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

    const absolutePlainPath = plainPathResolver.resolve(plainFilepath)
    invariant(isFileSync(absolutePlainPath), `[${title}] Not a file ${absolutePlainPath}.`)

    const { ctimeMs, mtimeMs, size } = await stat(absolutePlainPath)
    const fingerprint = await calcFingerprintFromFile(absolutePlainPath, contentHashAlgorithm)
    const relativePlainPath: string = plainPathResolver.relative(absolutePlainPath)
    const keepIntegrity: boolean = context.isKeepIntegrity(relativePlainPath)
    const keepPlain: boolean = context.isKeepPlain(relativePlainPath)

    const cryptPath: string = this.calcCryptFilepath(relativePlainPath)
    const cryptPathParts: string[] = Array.from(
      calcFilePartNames(
        Array.from(calcFilePartItemsBySize(size, maxTargetFileSize)),
        partCodePrefix,
      ),
    )

    return {
      plainPath: relativePlainPath,
      cryptPath,
      cryptPathParts,
      fingerprint,
      keepIntegrity,
      keepPlain,
      ctime: ctimeMs,
      mtime: mtimeMs,
      size,
    }
  }

  // @override
  public calcCryptFilepath(plainPath: string): string {
    const { context } = this
    const { plainPathResolver } = context
    const relativePlainPath = plainPathResolver.relative(plainPath)
    if (context.isKeepPlain(relativePlainPath)) return relativePlainPath

    const { cryptFilepathSalt, cryptFilesDir, cryptPathResolver, pathHashAlgorithm } = context
    const plainFilepathKey: string = this.normalizePlainFilepath(relativePlainPath)
    const filepathHash: string = calcFingerprintFromString(
      cryptFilepathSalt + plainFilepathKey,
      'utf8',
      pathHashAlgorithm,
    )
    const cryptPath: string = cryptPathResolver.relative(cryptFilesDir + '/' + filepathHash)
    return cryptPath
  }

  // @override
  public async calcIv(
    item: IDeserializedCatalogItem | IDraftCatalogItem,
  ): Promise<Uint8Array | undefined> {
    const { context } = this
    return context.calcIv(item)
  }

  // @override
  public async checkCryptIntegrity(cryptPaths: string[]): Promise<void> {
    const title = `${clazz}.checkCryptIntegrity`
    const { context, items } = this
    const { cryptPathResolver } = context
    const filepathSet: Set<string> = new Set(cryptPaths.map(p => cryptPathResolver.relative(p)))

    let count = 0
    for (const item of items) {
      if (item.cryptPathParts.length > 1) {
        for (const filePart of item.cryptPathParts) {
          const cryptFilepath = item.cryptPath + filePart
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
        const { cryptPath } = item
        const absoluteCryptPath = cryptPathResolver.resolve(cryptPath)
        count += 1

        invariant(filepathSet.has(cryptPath), `[${title}] Unexpected cryptFilepath. ${cryptPath}`)
        invariant(isFileSync(absoluteCryptPath), `[${title}] Missing crypt file. ${cryptPath}`)
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
      const { plainPath } = item
      const absolutePlainPath = plainPathResolver.resolve(plainPath)
      count += 1

      invariant(filepathSet.has(plainPath), `[${title}] Unexpected plainFilepath. ${plainPath}`)
      invariant(isFileSync(absolutePlainPath), `[${title}] Missing plain file. (${plainPath})`)
    }

    invariant(
      filepathSet.size === count,
      `[${title}] Count of plain filepaths are not match. expect(${filepathSet.size}), received(${count})`,
    )
  }

  // @override
  public abstract find(filter: (item: ICatalogItem) => boolean): ICatalogItem | undefined

  // @override
  public async flatItem(item: IDeserializedCatalogItem): Promise<ICatalogItem> {
    const cryptPath: string = this.calcCryptFilepath(item.plainPath)
    const iv: Uint8Array | undefined = await this.calcIv(item)
    return { ...item, cryptPath, iv }
  }

  // @override
  public abstract get(plainPath: string): ICatalogItem | undefined

  // @override
  public abstract has(plainPath: string): boolean

  // @override
  public isKeepIntegrity(relativePlainPath: string): boolean {
    return this.context.isKeepIntegrity(relativePlainPath)
  }

  // @override
  public isKeepPlain(relativePlainPath: string): boolean {
    return this.context.isKeepPlain(relativePlainPath)
  }

  // @override
  public abstract monitor(monitor: Partial<ICipherCatalogMonitor>): IUnMonitorCipherCatalog

  // @override
  public normalizePlainFilepath(plainFilepath: string): string {
    const { context } = this
    const { plainPathResolver } = context
    return normalizePlainPath(plainFilepath, plainPathResolver)
  }
}
