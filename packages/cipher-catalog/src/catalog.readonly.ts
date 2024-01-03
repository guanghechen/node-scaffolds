import type {
  ICatalogDiffItem,
  ICatalogItem,
  ICipherCatalogContext,
  IDeserializedCatalogItem,
  IDraftCatalogDiffItem,
  IDraftCatalogItem,
  IReadonlyCipherCatalog,
} from '@guanghechen/cipher-catalog.types'
import { calcFilePartItemsBySize, calcFilePartNames } from '@guanghechen/filepart'
import { invariant } from '@guanghechen/internal'
import { diffFromCatalogItems } from './util/diffFromCatalogItems'
import { diffFromPlainFiles } from './util/diffFromPlainFiles'
import { calcFingerprintFromString } from './util/fingerprint'

const clazz = 'ReadonlyCipherCatalog'

export abstract class ReadonlyCipherCatalog implements IReadonlyCipherCatalog {
  public readonly context: ICipherCatalogContext

  constructor(context: ICipherCatalogContext) {
    this.context = context
  }

  protected abstract readonly itemMap: ReadonlyMap<string, ICatalogItem>

  // @override
  public get items(): Iterable<ICatalogItem> {
    return this.itemMap.values()
  }

  // @override
  public async calcCatalogItem(plainPath: string): Promise<IDraftCatalogItem | never> {
    const title = `${clazz}.calcCatalogItem`
    const { context } = this

    const isPlainPathExist: boolean = await context.isPlainPathExist(plainPath)
    invariant(isPlainPathExist, `[${title}] Not a file ${plainPath}.`)

    const stat = await context.statPlainFile(plainPath)
    invariant(!!stat, `[${title}] Cannot get the stat of a plain path.`)

    const { ctime, mtime, size } = stat
    const cryptPath: string = await this.calcCryptPath(plainPath)
    const cryptPathParts: string[] = Array.from(
      calcFilePartNames(
        Array.from(calcFilePartItemsBySize(size, context.MAX_CRYPT_FILE_SIZE)),
        context.PART_CODE_PREFIX,
      ),
    )
    const fingerprint = await context.hashPlainFile(plainPath)
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
  public async calcCryptPath(plainPath: string): Promise<string> {
    const { context } = this
    const isPlainFileKeepPlain: boolean = await context.isKeepPlain(plainPath)
    if (isPlainFileKeepPlain) return plainPath

    const { CRYPT_PATH_SALT, CRYPT_FILES_DIR, PATH_HASH_ALGORITHM } = context
    const message: string = CRYPT_PATH_SALT + plainPath
    const hash1: string = calcFingerprintFromString(message, 'utf8', PATH_HASH_ALGORITHM)
    const hash2: string = calcFingerprintFromString(hash1 + message, 'utf8', PATH_HASH_ALGORITHM)
    const cryptPath: string = CRYPT_FILES_DIR + '/' + hash2
    return cryptPath
  }

  // @override
  public async checkCryptIntegrity(
    allCryptPaths: ReadonlySet<string>,
    returnImmediatelyOnError: boolean,
  ): Promise<string[]> {
    const title = `${clazz}.checkCryptIntegrity`
    const errors: string[] = []
    const { context, items } = this

    const checkCryptPathWithoutPart = async (item: ICatalogItem): Promise<void> => {
      const cryptPath: string = item.cryptPath

      if (!allCryptPaths.has(cryptPath)) {
        errors.push(`[${title}] Unexpected cryptPath. (${cryptPath})`)
        return
      }

      const isCryptPathExist: boolean = await context.isCryptPathExist(cryptPath)
      if (!isCryptPathExist) {
        errors.push(`[${title}] Missing crypt file. (${cryptPath})`)
        return
      }

      const stat = await context.statCryptFile(cryptPath)
      if (stat === undefined) {
        errors.push(`[${title}] Cannot stat the crypt file. (${cryptPath})`)
        return
      }

      if (stat.size !== item.size) {
        errors.push(`[${title}] Crypt file size are not matched. (${cryptPath})`)
        return
      }
    }

    const checkCryptPathWithParts = async (item: ICatalogItem): Promise<void> => {
      let acc: number = 0
      for (let i = 0; i < item.cryptPathParts.length; ++i) {
        const cryptPath: string = item.cryptPath + item.cryptPathParts[i]

        if (!allCryptPaths.has(cryptPath)) {
          errors.push(`[${title}] Unexpected cryptPath. (${cryptPath})`)
          return
        }

        const isCryptPathExist: boolean = await context.isCryptPathExist(cryptPath)
        if (!isCryptPathExist) {
          errors.push(`[${title}] Missing crypt file part. (${cryptPath})`)
          return
        }

        const stat = await context.statCryptFile(cryptPath)
        if (stat === undefined) {
          errors.push(`[${title}] Cannot stat the crypt file. (${cryptPath})`)
          return
        }

        acc += stat.size
        if (i + 1 < item.cryptPathParts.length) {
          if (stat.size !== context.MAX_CRYPT_FILE_SIZE) {
            errors.push(
              `[${title}] Crypt file part size are not matched with the MAX_CRYPT_FILE_SIZE. (${cryptPath})`,
            )
          }
        } else {
          if (acc !== item.size) {
            errors.push(`[${title}] Crypt file size are not matched. (${cryptPath})`)
            return
          }
        }
      }
    }

    let count = 0
    for (const item of items) {
      if (returnImmediatelyOnError && errors.length > 0) return errors

      if (item.cryptPathParts.length > 1) await checkCryptPathWithParts(item)
      else await checkCryptPathWithoutPart(item)
      count += item.cryptPathParts.length
    }
    if (allCryptPaths.size !== count) {
      errors.push(
        `[${title}] Count of crypt filepaths are not matched. expect(${allCryptPaths.size}), received(${count})`,
      )
    }
    return errors
  }

  // @override
  public async checkPlainIntegrity(
    allPlainPaths: ReadonlySet<string>,
    returnImmediatelyOnError: boolean,
  ): Promise<string[]> {
    const title = `${clazz}.checkPlainIntegrity`
    const errors: string[] = []
    const { context, items } = this

    const checkPlainPath = async (item: ICatalogItem): Promise<void> => {
      const plainPath: string = item.plainPath

      if (!allPlainPaths.has(plainPath)) {
        errors.push(`[${title}] Unexpected plainPath. (${plainPath})`)
        return
      }

      const isPlainPathExist: boolean = await context.isPlainPathExist(plainPath)
      if (!isPlainPathExist) {
        errors.push(`[${title}] Missing plain file. (${plainPath})`)
        return
      }

      const stat = await context.statPlainFile(plainPath)
      if (stat === undefined) {
        errors.push(`[${title}] Cannot stat the plain file. (${plainPath})`)
        return
      }

      if (stat.size !== item.size) {
        errors.push(`[${title}] Plain file size are not matched. (${plainPath})`)
        return
      }

      const fingerprint = await context.hashPlainFile(plainPath)
      if (item.fingerprint !== fingerprint) {
        errors.push(`[${title}] Plain file fingerprint are not matched. (${plainPath})`)
        return
      }
    }

    let count = 0
    for (const item of items) {
      if (returnImmediatelyOnError && errors.length > 0) return errors

      await checkPlainPath(item)
      count += 1
    }

    if (allPlainPaths.size !== count) {
      errors.push(
        `[${title}] Count of plain filepaths are not matched. expect(${allPlainPaths.size}), received(${count})`,
      )
    }
    return errors
  }

  // @override
  public diffFromCatalogItems(newItems: Iterable<ICatalogItem>): ICatalogDiffItem[] {
    return diffFromCatalogItems(this.itemMap, newItems)
  }

  // @override
  public diffFromPlainFiles(
    plainFilepaths: string[],
    strickCheck: boolean,
  ): Promise<IDraftCatalogDiffItem[]> {
    return diffFromPlainFiles(this, this.itemMap, plainFilepaths, strickCheck)
  }

  // @override
  public find(filter: (item: ICatalogItem) => boolean): ICatalogItem | undefined {
    for (const item of this.itemMap.values()) {
      if (filter(item)) return item
    }
    return undefined
  }

  // @override
  public async flatItem(item: IDeserializedCatalogItem): Promise<ICatalogItem> {
    const cryptPath: string = await this.calcCryptPath(item.plainPath)
    return { ...item, cryptPath }
  }

  // @override
  public get(plainPath: string): ICatalogItem | undefined {
    return this.itemMap.get(plainPath)
  }

  // @override
  public has(plainPath: string): boolean {
    return this.itemMap.has(plainPath)
  }
}
