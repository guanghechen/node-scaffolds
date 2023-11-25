import { FileChangeType } from '@guanghechen/cipher-workspace.types'
import type {
  ICatalogDiffItem,
  ICatalogDiffItemCombine,
  ICatalogItem,
  ICipherCatalog,
  ICipherCatalogContext,
  IDraftCatalogDiffItem,
} from '@guanghechen/cipher-workspace.types'
import { iterable2map, mapIterable } from '@guanghechen/helper-func'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import { diffFromCatalogItems } from './catalog/diffFromCatalogItems'
import { diffFromPlainFiles } from './catalog/diffFromPlainFiles'
import { normalizePlainFilepath } from './catalog/normalizePlainFilepath'
import { ReadonlyFileCipherCatalog } from './FileCipherCatalog.readonly'

export interface IFileCipherCatalogProps {
  readonly context: ICipherCatalogContext
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
}

export class FileCipherCatalog extends ReadonlyFileCipherCatalog implements ICipherCatalog {
  readonly #itemMap: Map<string, ICatalogItem>

  constructor(props: IFileCipherCatalogProps) {
    super(props)
    this.#itemMap = new Map()
  }

  // @override
  public override get items(): Iterable<ICatalogItem> {
    return this.#itemMap.values()
  }

  // @override
  public reset(items?: Iterable<ICatalogItem>): void {
    const itemMap = this.#itemMap
    itemMap.clear()

    if (items) {
      for (const item of items) {
        const key: string = normalizePlainFilepath(item.plainFilepath, this.plainPathResolver)
        itemMap.set(key, item)
      }
    }
  }

  // @override
  public applyDiff(diffItems: Iterable<ICatalogDiffItem>): void {
    const itemMap = this.#itemMap
    for (const diffItem of diffItems) {
      const { oldItem, newItem } = diffItem as ICatalogDiffItemCombine
      if (oldItem) {
        const key: string = normalizePlainFilepath(oldItem.plainFilepath, this.plainPathResolver)
        itemMap.delete(key)
      }
      if (newItem) {
        const key: string = normalizePlainFilepath(newItem.plainFilepath, this.plainPathResolver)
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
    const oldItemMap = this.#itemMap as ReadonlyMap<string, ICatalogItem>
    if (oldItemMap.size < 1) {
      return mapIterable(newItems, newItem => ({ changeType: FileChangeType.ADDED, newItem }))
    }

    const newItemMap: Map<string, ICatalogItem> = iterable2map(newItems, item => item.plainFilepath)
    return diffFromCatalogItems(oldItemMap, newItemMap)
  }

  // @override
  public async diffFromPlainFiles(
    plainFilepaths: string[],
    strickCheck: boolean,
  ): Promise<IDraftCatalogDiffItem[]> {
    return diffFromPlainFiles({
      context: this.context,
      oldItemMap: this.#itemMap,
      plainFilepaths,
      plainPathResolver: this.plainPathResolver,
      strickCheck,
    })
  }
}
