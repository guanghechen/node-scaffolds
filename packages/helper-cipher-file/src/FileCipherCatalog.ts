import type { Logger } from '@guanghechen/chalk-logger'
import { isFileSync } from '@guanghechen/helper-fs'
import { list2map, mapIterable } from '@guanghechen/helper-func'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import { ReadonlyFileCipherCatalog } from './FileCipherCatalog.readonly'
import type {
  IDiffFromCatalogItemsParams,
  IDiffFromPlainFiles,
  IFileCipherCatalog,
} from './types/IFileCipherCatalog'
import type {
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogDiffItemCombine,
  IFileCipherCatalogDiffItemDraft,
} from './types/IFileCipherCatalogDiffItem'
import { FileChangeType } from './types/IFileCipherCatalogDiffItem'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDraft,
} from './types/IFileCipherCatalogItem'
import {
  isSameFileCipherItem,
  isSameFileCipherItemDraft,
  normalizePlainFilepath,
} from './util/catalog'

export interface IFileCipherCatalogProps {
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
  }: IDiffFromCatalogItemsParams): IFileCipherCatalogDiffItem[] {
    const oldItemMap = this.#itemMap as ReadonlyMap<string, IFileCipherCatalogItem>
    if (oldItemMap.size < 1) {
      return mapIterable(newItems, newItem => ({ changeType: FileChangeType.ADDED, newItem }))
    }

    const newItemMap: Map<string, IFileCipherCatalogItem> = list2map(
      newItems,
      item => item.plainFilepath,
    )
    if (newItemMap.size < 1) {
      return mapIterable(oldItemMap.values(), oldItem => ({
        changeType: FileChangeType.REMOVED,
        oldItem,
      }))
    }

    const addedItems: IFileCipherCatalogDiffItem[] = []
    const modifiedItems: IFileCipherCatalogDiffItem[] = []
    const removedItems: IFileCipherCatalogDiffItem[] = []

    // Collect removed and modified items.
    for (const oldItem of oldItemMap.values()) {
      const newItem = newItemMap.get(oldItem.plainFilepath)
      if (newItem === undefined) {
        removedItems.push({
          changeType: FileChangeType.REMOVED,
          oldItem,
        })
      } else {
        if (!isSameFileCipherItem(oldItem, newItem)) {
          modifiedItems.push({
            changeType: FileChangeType.MODIFIED,
            oldItem,
            newItem,
          })
        }
      }
    }

    // Collect added items.
    for (const newItem of newItemMap.values()) {
      if (!oldItemMap.has(newItem.plainFilepath)) {
        addedItems.push({
          changeType: FileChangeType.ADDED,
          newItem,
        })
      }
    }

    newItemMap.clear()
    return [...removedItems, ...addedItems, ...modifiedItems]
  }

  // @override
  public async diffFromPlainFiles({
    plainFilepaths,
    strickCheck,
    isKeepPlain,
  }: IDiffFromPlainFiles): Promise<IFileCipherCatalogDiffItemDraft[]> {
    const itemMap = this.#itemMap
    const { plainPathResolver } = this
    const addedItems: IFileCipherCatalogDiffItemDraft[] = []
    const modifiedItems: IFileCipherCatalogDiffItemDraft[] = []
    const removedItems: IFileCipherCatalogDiffItemDraft[] = []
    for (const plainFilepath of plainFilepaths) {
      const key = normalizePlainFilepath(plainFilepath, plainPathResolver)
      const oldItem = itemMap.get(key)
      const absolutePlainFilepath = plainPathResolver.absolute(plainFilepath)
      const isSrcFileExists = isFileSync(absolutePlainFilepath)

      if (isSrcFileExists) {
        const newItem: IFileCipherCatalogItemDraft = await this.calcCatalogItem({
          plainFilepath,
          isKeepPlain,
        })

        if (oldItem) {
          if (!isSameFileCipherItemDraft(oldItem, newItem)) {
            modifiedItems.push({ changeType: FileChangeType.MODIFIED, oldItem, newItem })
          }
        } else {
          addedItems.push({ changeType: FileChangeType.ADDED, newItem })
        }
      } else {
        if (oldItem) {
          removedItems.push({ changeType: FileChangeType.REMOVED, oldItem })
        }

        if (strickCheck) {
          invariant(
            !!oldItem,
            `[diffFromPlainFiles] plainFilepath(${plainFilepath}) is removed but it's not in the catalog before.`,
          )
        }
      }
    }
    return [...removedItems, ...addedItems, ...modifiedItems]
  }
}
