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
import { calcFingerprintFromString } from './util/fingerprint'

const clazz = 'ReadonlyFileCipherCatalog'

export abstract class ReadonlyFileCipherCatalog implements IReadonlyCipherCatalog {
  public readonly context: ICipherCatalogContext

  constructor(context: ICipherCatalogContext) {
    this.context = context
  }

  // @override
  public abstract readonly items: Iterable<ICatalogItem>

  // @override
  public async calcCatalogItem(filepath: string): Promise<IDraftCatalogItem | never> {
    const title = `${clazz}.calcCatalogItem`
    const { context } = this
    const { MAX_CRYPT_FILE_SIZE, PART_CODE_PREFIX } = context

    const plainPath: string = this.normalizePlainPath(filepath)
    invariant(await context.isPlainPathExist(plainPath), `[${title}] Not a file ${plainPath}.`)

    const stat = await context.statPlainFile(plainPath)
    invariant(!!stat, `[${title}] Cannot get the stat of a plain path.`)

    const { ctime, mtime, size } = stat
    const fingerprint = await context.calcFingerprint(plainPath)
    const keepIntegrity: boolean = await context.isKeepIntegrity(plainPath)
    const keepPlain: boolean = await context.isKeepPlain(plainPath)

    const cryptPath: string = await this.calcCryptFilepath(plainPath)
    const cryptPathParts: string[] = Array.from(
      calcFilePartNames(
        Array.from(calcFilePartItemsBySize(size, MAX_CRYPT_FILE_SIZE)),
        PART_CODE_PREFIX,
      ),
    )

    const nonce: Uint8Array = await context.genNonce()
    const draftItem: IDraftCatalogItem = {
      plainPath,
      cryptPath,
      cryptPathParts,
      fingerprint,
      keepIntegrity,
      keepPlain,
      nonce,
      ctime,
      mtime,
      size,
    }
    return draftItem
  }

  // @override
  public async calcCryptFilepath(plainPath: string): Promise<string> {
    const { context } = this
    const { plainPathResolver } = context
    const relativePlainPath = plainPathResolver.relative(plainPath)
    const isPlainFileKeepPlain: boolean = await context.isKeepPlain(relativePlainPath)
    if (isPlainFileKeepPlain) return relativePlainPath

    const { cryptPathSalt, cryptFilesDir, cryptPathResolver, PATH_HASH_ALGORITHM } = context
    const plainFilepathKey: string = this.normalizePlainPath(relativePlainPath)
    const filepathHash: string = calcFingerprintFromString(
      cryptPathSalt + plainFilepathKey,
      'utf8',
      PATH_HASH_ALGORITHM,
    )
    const cryptPath: string = cryptPathResolver.relative(cryptFilesDir + '/' + filepathHash)
    return cryptPath
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
    const cryptPath: string = await this.calcCryptFilepath(item.plainPath)
    return { ...item, cryptPath }
  }

  // @override
  public abstract get(plainPath: string): ICatalogItem | undefined

  // @override
  public abstract has(plainPath: string): boolean

  // @override
  public abstract monitor(monitor: Partial<ICipherCatalogMonitor>): IUnMonitorCipherCatalog

  // @override
  public normalizePlainPath(plainPath: string): string {
    return normalizePlainPath(plainPath, this.context.plainPathResolver)
  }
}
