import { iterable2map, mapIterable } from '@guanghechen/helper-func'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import { diffFromCatalogItems } from './catalog/diffFromCatalogItems'
import { diffFromPlainFiles } from './catalog/diffFromPlainFiles'
import { normalizePlainFilepath } from './catalog/normalizePlainFilepath'
import { ReadonlyFileCipherCatalog } from './FileCipherCatalog.readonly'
import type {
  ICatalogDiffFromCatalogItemsParams,
  ICatalogDiffFromPlainFiles,
  IFileCipherCatalog,
} from './types/IFileCipherCatalog'
import type { IFileCipherCatalogContext } from './types/IFileCipherCatalogContext'
import type {
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogDiffItemCombine,
  IFileCipherCatalogDiffItemDraft,
} from './types/IFileCipherCatalogDiffItem'
import { FileChangeType } from './types/IFileCipherCatalogDiffItem'
import type { IFileCipherCatalogItem } from './types/IFileCipherCatalogItem'

export interface IFileCipherCatalogProps {
  readonly context: IFileCipherCatalogContext
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
}

export class FileCipherCatalog extends ReadonlyFileCipherCatalog implements IFileCipherCatalog {
  readonly #itemMap: Map<string, IFileCipherCatalogItem>

  constructor(props: IFileCipherCatalogProps) {
    super(props)
    this.#itemMap = new Map()
  }

  // @override
  public override get items(): Iterable<IFileCipherCatalogItem> {
    return this.#itemMap.values()
  }

  // @override
  public reset(items?: Iterable<IFileCipherCatalogItem>): void {
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
  public applyDiff(diffItems: Iterable<IFileCipherCatalogDiffItem>): void {
    const itemMap = this.#itemMap
    for (const diffItem of diffItems) {
      const { oldItem, newItem } = diffItem as IFileCipherCatalogDiffItemCombine
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
  public diffFromCatalogItems({
    newItems,
  }: ICatalogDiffFromCatalogItemsParams): IFileCipherCatalogDiffItem[] {
    const oldItemMap = this.#itemMap as ReadonlyMap<string, IFileCipherCatalogItem>
    if (oldItemMap.size < 1) {
      return mapIterable(newItems, newItem => ({ changeType: FileChangeType.ADDED, newItem }))
    }

    const newItemMap: Map<string, IFileCipherCatalogItem> = iterable2map(
      newItems,
      item => item.plainFilepath,
    )
    return diffFromCatalogItems(oldItemMap, newItemMap)
  }

  // @override
  public async diffFromPlainFiles(
    params: ICatalogDiffFromPlainFiles,
  ): Promise<IFileCipherCatalogDiffItemDraft[]> {
    return diffFromPlainFiles({
      context: this.context,
      oldItemMap: this.#itemMap,
      plainFilepaths: params.plainFilepaths,
      plainPathResolver: this.plainPathResolver,
      strickCheck: params.strickCheck,
    })
  }
}
