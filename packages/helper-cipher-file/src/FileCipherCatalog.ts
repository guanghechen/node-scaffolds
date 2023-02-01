import type { Logger } from '@guanghechen/chalk-logger'
import { calcFilePartItemsBySize, calcFilePartNames } from '@guanghechen/helper-file'
import { isFileSync } from '@guanghechen/helper-fs'
import { list2map, mapIterable } from '@guanghechen/helper-func'
import invariant from '@guanghechen/invariant'
import fs from 'node:fs/promises'
import path from 'node:path'
import { FileChangeType } from './constant'
import type { FileCipherPathResolver } from './FileCipherPathResolver'
import type {
  ICalcCatalogItemParams,
  ICheckIntegrityParams,
  IDiffFromCatalogItemsParams,
  IDiffFromSourceFiles,
  IFileCipherCatalog,
} from './types/IFileCipherCatalog'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
  IFileCipherCatalogItemDiffCombine,
} from './types/IFileCipherCatalogItem'
import { isSameFileCipherItem, normalizeSourceFilepath } from './util/catalog'
import { calcFingerprintFromFile, calcFingerprintFromString } from './util/mac'

export interface IFileCipherCatalogProps {
  pathResolver: FileCipherPathResolver
  maxTargetFileSize: number
  partCodePrefix: string
  encryptedDir: string
  logger?: Logger
  isKeepPlain(relativeSourceFilepath: string): boolean
}

export class FileCipherCatalog implements IFileCipherCatalog {
  public readonly pathResolver: FileCipherPathResolver
  public readonly maxTargetFileSize: number
  public readonly partCodePrefix: string
  public readonly encryptedDir: string
  protected readonly logger?: Logger
  protected readonly isKeepPlain: (relativeSourceFilepath: string) => boolean
  protected readonly _itemMap: Map<string, IFileCipherCatalogItem>

  constructor(props: IFileCipherCatalogProps) {
    this.pathResolver = props.pathResolver
    this.maxTargetFileSize = props.maxTargetFileSize
    this.partCodePrefix = props.partCodePrefix
    this.encryptedDir = props.encryptedDir
    this.isKeepPlain = props.isKeepPlain
    this._itemMap = new Map()
    this.logger = props.logger
  }

  // @override
  public get items(): Iterable<IFileCipherCatalogItem> {
    return this._itemMap.values()
  }

  // @override
  public reset(items?: Iterable<IFileCipherCatalogItem>): void {
    const { _itemMap, pathResolver } = this
    _itemMap.clear()
    if (items) {
      for (const item of items) {
        const key: string = normalizeSourceFilepath(item.sourceFilepath, pathResolver)
        _itemMap.set(key, item)
      }
    }
  }

  // @override
  public applyDiff(diffItems: Iterable<IFileCipherCatalogItemDiff>): void {
    const { _itemMap, pathResolver } = this
    for (const diffItem of diffItems) {
      const { oldItem, newItem } = diffItem as IFileCipherCatalogItemDiffCombine
      if (oldItem) {
        const key = normalizeSourceFilepath(oldItem.sourceFilepath, pathResolver)
        _itemMap.delete(key)
      }
      if (newItem) {
        const key = normalizeSourceFilepath(newItem.sourceFilepath, pathResolver)
        _itemMap.set(key, {
          sourceFilepath: newItem.sourceFilepath,
          encryptedFilepath: newItem.encryptedFilepath,
          encryptedFileParts: newItem.encryptedFileParts,
          fingerprint: newItem.fingerprint,
          size: newItem.size,
          keepPlain: newItem.keepPlain,
        })
      }
    }
  }

  // @override
  public async calcCatalogItem({
    sourceFilepath,
    isKeepPlain = this.isKeepPlain,
  }: ICalcCatalogItemParams): Promise<IFileCipherCatalogItem | never> {
    const { encryptedDir, maxTargetFileSize, partCodePrefix, pathResolver } = this
    const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(sourceFilepath)
    const relativeSourceFilepath = pathResolver.calcRelativeSourceFilepath(absoluteSourceFilepath)
    const sourceFilepathKey = normalizeSourceFilepath(relativeSourceFilepath, pathResolver)

    const fileSize = await fs.stat(absoluteSourceFilepath).then(md => md.size)
    const fingerprint: string = await calcFingerprintFromFile(absoluteSourceFilepath)
    const keepPlain: boolean = isKeepPlain(relativeSourceFilepath)
    const encryptedFilepath: string = keepPlain
      ? relativeSourceFilepath
      : path.join(encryptedDir, calcFingerprintFromString(sourceFilepathKey, 'utf8'))
    const encryptedFileParts = calcFilePartNames(
      calcFilePartItemsBySize(fileSize, maxTargetFileSize),
      partCodePrefix,
    )
    const item: IFileCipherCatalogItem = {
      sourceFilepath: relativeSourceFilepath,
      encryptedFilepath,
      encryptedFileParts: encryptedFileParts.length > 1 ? encryptedFileParts : [],
      fingerprint,
      size: fileSize,
      keepPlain,
    }
    return item
  }

  // @override
  public async checkIntegrity({ flags }: ICheckIntegrityParams): Promise<void | never> {
    const { _itemMap, logger, pathResolver } = this
    if (flags.sourceFiles) {
      logger?.debug('[checkIntegrity] checking source files.')
      for (const item of _itemMap.values()) {
        const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(item.sourceFilepath)
        invariant(
          isFileSync(absoluteSourceFilepath),
          `[checkIntegrity] Missing source file. (${absoluteSourceFilepath})`,
        )
      }
    }

    if (flags.encryptedFiles) {
      logger?.debug('[checkIntegrity] checking encrypted files.')
      for (const item of _itemMap.values()) {
        if (item.encryptedFileParts.length > 1) {
          for (const filePart of item.encryptedFileParts) {
            const encryptedFilepath = item.encryptedFilepath + filePart
            const absoluteEncryptedFilepath =
              pathResolver.calcAbsoluteEncryptedFilepath(encryptedFilepath)
            invariant(
              isFileSync(absoluteEncryptedFilepath),
              `[checkIntegrity] Missing encrypted file part. (${absoluteEncryptedFilepath})`,
            )
          }
        } else {
          const absoluteEncryptedFilepath = pathResolver.calcAbsoluteEncryptedFilepath(
            item.encryptedFilepath,
          )
          invariant(
            isFileSync(absoluteEncryptedFilepath),
            `[checkIntegrity] Missing encrypted file. (${absoluteEncryptedFilepath})`,
          )
        }
      }
    }
  }

  // @override
  public diffFromCatalogItems({
    newItems,
  }: IDiffFromCatalogItemsParams): IFileCipherCatalogItemDiff[] {
    const oldItemMap = this._itemMap as ReadonlyMap<string, IFileCipherCatalogItem>
    if (oldItemMap.size < 1) {
      return mapIterable(newItems, newItem => ({ changeType: FileChangeType.ADDED, newItem }))
    }

    const newItemMap: Map<string, IFileCipherCatalogItem> = list2map(
      newItems,
      item => item.sourceFilepath,
    )
    if (newItemMap.size < 1) {
      return mapIterable(oldItemMap.values(), oldItem => ({
        changeType: FileChangeType.REMOVED,
        oldItem,
      }))
    }

    const addedItems: IFileCipherCatalogItemDiff[] = []
    const modifiedItems: IFileCipherCatalogItemDiff[] = []
    const removedItems: IFileCipherCatalogItemDiff[] = []

    // Collect removed and modified items.
    for (const oldItem of oldItemMap.values()) {
      const newItem = newItemMap.get(oldItem.sourceFilepath)
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
      if (!oldItemMap.has(newItem.sourceFilepath)) {
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
  public async diffFromSourceFiles({
    sourceFilepaths,
    isKeepPlain,
  }: IDiffFromSourceFiles): Promise<IFileCipherCatalogItemDiff[]> {
    const { pathResolver, _itemMap } = this
    const addedItems: IFileCipherCatalogItemDiff[] = []
    const modifiedItems: IFileCipherCatalogItemDiff[] = []
    const removedItems: IFileCipherCatalogItemDiff[] = []
    for (const sourceFilepath of sourceFilepaths) {
      const key = normalizeSourceFilepath(sourceFilepath, pathResolver)
      const oldItem = _itemMap.get(key)
      const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(sourceFilepath)
      const isSrcFileExists = isFileSync(absoluteSourceFilepath)

      if (!isSrcFileExists && oldItem) {
        removedItems.push({ changeType: FileChangeType.REMOVED, oldItem })
        continue
      }

      const newItem: IFileCipherCatalogItem = await this.calcCatalogItem({
        sourceFilepath,
        isKeepPlain,
      })

      if (oldItem) {
        if (!isSameFileCipherItem(oldItem, newItem)) {
          modifiedItems.push({ changeType: FileChangeType.MODIFIED, oldItem, newItem })
        }
      } else {
        addedItems.push({ changeType: FileChangeType.ADDED, newItem })
      }
    }
    return [...removedItems, ...addedItems, ...modifiedItems]
  }
}
