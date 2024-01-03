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
  public async calcCatalogItem(plainPath: string): Promise<IDraftCatalogItem | never> {
    const title = `${clazz}.calcCatalogItem`
    const { context } = this

    const isPlainPathExist: boolean = await context.isPlainPathExist(plainPath)
    invariant(isPlainPathExist, `[${title}] Not a file ${plainPath}.`)

    const stat = await context.statPlainFile(plainPath)
    invariant(!!stat, `[${title}] Cannot get the stat of a plain path.`)

    const { ctime, mtime, size } = stat
    const cryptPath: string = await this.calcCryptFilepath(plainPath)
    const cryptPathParts: string[] = Array.from(
      calcFilePartNames(
        Array.from(calcFilePartItemsBySize(size, context.MAX_CRYPT_FILE_SIZE)),
        context.PART_CODE_PREFIX,
      ),
    )
    const fingerprint = await context.calcFingerprint(plainPath)
    const keepIntegrity: boolean = await context.isKeepIntegrity(plainPath)
    const keepPlain: boolean = await context.isKeepPlain(plainPath)
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
    const isPlainFileKeepPlain: boolean = await context.isKeepPlain(plainPath)
    if (isPlainFileKeepPlain) return plainPath

    const { cryptPathSalt, cryptFilesDir, PATH_HASH_ALGORITHM } = context
    const filepathHash: string = calcFingerprintFromString(
      cryptPathSalt + plainPath,
      'utf8',
      PATH_HASH_ALGORITHM,
    )
    const cryptPath: string = cryptFilesDir + '/' + filepathHash
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
  public async checkPlainIntegrity(plainPaths: string[]): Promise<void> {
    const title = `${clazz}.checkPlainIntegrity`
    const { context, items } = this
    const { plainPathResolver } = context
    const filepathSet: Set<string> = new Set(plainPaths.map(p => plainPathResolver.relative(p)))

    let count = 0
    for (const item of items) {
      const { plainPath } = item
      count += 1

      invariant(filepathSet.has(plainPath), `[${title}] Unexpected plainFilepath. ${plainPath}`)
      invariant(
        await context.isPlainPathExist(plainPath),
        `[${title}] Missing plain file. (${plainPath})`,
      )
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
}
