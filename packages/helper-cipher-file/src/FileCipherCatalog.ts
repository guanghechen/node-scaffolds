import { list2map, mapIterable } from '@guanghechen/helper-func'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import type { FilepathResolver } from '@guanghechen/helper-path'
import { diffFromCatalogItems } from './catalog/diffFromCatalogItems'
import { diffFromPlainFiles } from './catalog/diffFromPlainFiles'
import { normalizePlainFilepath } from './catalog/normalizePlainFilepath'
import { ReadonlyFileCipherCatalog } from './FileCipherCatalog.readonly'
import type {
  ICatalogDiffFromCatalogItemsParams,
  ICatalogDiffFromPlainFiles,
  IFileCipherCatalog,
} from './types/IFileCipherCatalog'
import type {
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogDiffItemCombine,
  IFileCipherCatalogDiffItemDraft,
} from './types/IFileCipherCatalogDiffItem'
import { FileChangeType } from './types/IFileCipherCatalogDiffItem'
import type { IFileCipherCatalogItem } from './types/IFileCipherCatalogItem'

export interface IFileCipherCatalogProps {
  contentHashAlgorithm: IHashAlgorithm
  cryptFilepathSalt: string
  cryptFilesDir: string
  maxTargetFileSize: number
  partCodePrefix: string
  pathHashAlgorithm: IHashAlgorithm
  plainPathResolver: FilepathResolver
  isKeepPlain(relativePlainFilepath: string): boolean
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
      const { plainPathResolver } = this
      for (const item of items) {
        const key: string = normalizePlainFilepath(item.plainFilepath, plainPathResolver)
        itemMap.set(key, item)
      }
    }
  }

  // @override
  public applyDiff(diffItems: Iterable<IFileCipherCatalogDiffItem>): void {
    const itemMap = this.#itemMap
    const { plainPathResolver } = this
    for (const diffItem of diffItems) {
      const { oldItem, newItem } = diffItem as IFileCipherCatalogDiffItemCombine
      if (oldItem) {
        const key = normalizePlainFilepath(oldItem.plainFilepath, plainPathResolver)
        itemMap.delete(key)
      }
      if (newItem) {
        const key = normalizePlainFilepath(newItem.plainFilepath, plainPathResolver)
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

    const newItemMap: Map<string, IFileCipherCatalogItem> = list2map(
      newItems,
      item => item.plainFilepath,
    )
    return diffFromCatalogItems({ oldItemMap, newItemMap })
  }

  // @override
  public async diffFromPlainFiles(
    params: ICatalogDiffFromPlainFiles,
  ): Promise<IFileCipherCatalogDiffItemDraft[]> {
    return diffFromPlainFiles({
      contentHashAlgorithm: this.contentHashAlgorithm,
      cryptFilepathSalt: this.cryptFilepathSalt,
      cryptFilesDir: this.cryptFilesDir,
      maxTargetFileSize: this.maxTargetFileSize,
      oldItemMap: this.#itemMap,
      partCodePrefix: this.partCodePrefix,
      pathHashAlgorithm: this.pathHashAlgorithm,
      plainFilepaths: params.plainFilepaths,
      plainPathResolver: this.plainPathResolver,
      strickCheck: params.strickCheck,
      isKeepPlain: params.isKeepPlain ?? this.isKeepPlain,
    })
  }
}
