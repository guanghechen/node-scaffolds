import type {
  ICatalogDiffItem,
  ICatalogDiffItemCombine,
  ICatalogItem,
  ICipherCatalog,
  ICipherCatalogContext,
  IDraftCatalogDiffItem,
} from '@guanghechen/cipher-workspace.types'
import { ReadonlyFileCipherCatalog } from './FileCipherCatalog.readonly'
import { diffFromCatalogItems } from './util/diffFromCatalogItems'
import { diffFromPlainFiles } from './util/diffFromPlainFiles'

export class FileCipherCatalog extends ReadonlyFileCipherCatalog implements ICipherCatalog {
  readonly #itemMap: Map<string, ICatalogItem>

  constructor(context: ICipherCatalogContext) {
    super(context)
    this.#itemMap = new Map()
  }

  // @override
  public override get items(): Iterable<ICatalogItem> {
    return this.#itemMap.values()
  }

  // @override
  public applyDiff(diffItems: Iterable<ICatalogDiffItem>): void {
    const itemMap = this.#itemMap
    for (const diffItem of diffItems) {
      const { oldItem, newItem } = diffItem as ICatalogDiffItemCombine
      if (oldItem) {
        const key: string = this.normalizePlainFilepath(oldItem.plainFilepath)
        itemMap.delete(key)
      }
      if (newItem) {
        const key: string = this.normalizePlainFilepath(newItem.plainFilepath)
        itemMap.set(key, {
          plainFilepath: newItem.plainFilepath,
          cryptFilepath: newItem.cryptFilepath,
          cryptFilepathParts: newItem.cryptFilepathParts,
          fingerprint: newItem.fingerprint,
          keepPlain: newItem.keepPlain,
          iv: newItem.iv,
          authTag: newItem.authTag,
        })
      }
    }
  }

  // @override
  public diffFromCatalogItems(newItems: Iterable<ICatalogItem>): ICatalogDiffItem[] {
    return diffFromCatalogItems(this.#itemMap, newItems)
  }

  // @override
  public diffFromPlainFiles(
    plainFilepaths: string[],
    strickCheck: boolean,
  ): Promise<IDraftCatalogDiffItem[]> {
    return diffFromPlainFiles(this, this.#itemMap, plainFilepaths, strickCheck)
  }

  // @override
  public reset(items?: Iterable<ICatalogItem>): void {
    const itemMap = this.#itemMap
    itemMap.clear()
    if (items) {
      for (const item of items) {
        const key: string = this.normalizePlainFilepath(item.plainFilepath)
        itemMap.set(key, item)
      }
    }
  }
}
