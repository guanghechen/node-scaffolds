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
  IDiffFromPlainFiles,
  IFileCipherCatalog,
} from './types/IFileCipherCatalog'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
  IFileCipherCatalogItemDiffCombine,
} from './types/IFileCipherCatalogItem'
import { isSameFileCipherItem, normalizePlainFilepath } from './util/catalog'
import {
  calcFingerprintFromFile,
  calcFingerprintFromMac,
  calcFingerprintFromString,
  calcMac,
} from './util/mac'

export interface IFileCipherCatalogProps {
  pathResolver: FileCipherPathResolver
  maxTargetFileSize: number
  partCodePrefix: string
  encryptedFilesDir: string
  encryptedFilePathSalt: string
  logger?: Logger
  isKeepPlain(relativePlainFilepath: string): boolean
}

export class FileCipherCatalog implements IFileCipherCatalog {
  public readonly pathResolver: FileCipherPathResolver
  public readonly maxTargetFileSize: number
  public readonly partCodePrefix: string
  public readonly encryptedFilesDir: string
  public readonly encryptedFilePathSalt: string
  protected readonly logger?: Logger
  protected readonly isKeepPlain: (relativePlainFilepath: string) => boolean
  protected readonly _itemMap: Map<string, IFileCipherCatalogItem>

  constructor(props: IFileCipherCatalogProps) {
    this.pathResolver = props.pathResolver
    this.maxTargetFileSize = props.maxTargetFileSize
    this.partCodePrefix = props.partCodePrefix
    this.encryptedFilesDir = props.encryptedFilesDir
    this.encryptedFilePathSalt = props.encryptedFilePathSalt
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
        const key: string = normalizePlainFilepath(item.plainFilepath, pathResolver)
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
        const key = normalizePlainFilepath(oldItem.plainFilepath, pathResolver)
        _itemMap.delete(key)
      }
      if (newItem) {
        const key = normalizePlainFilepath(newItem.plainFilepath, pathResolver)
        _itemMap.set(key, {
          plainFilepath: newItem.plainFilepath,
          cryptFilepath: newItem.cryptFilepath,
          cryptFileParts: newItem.cryptFileParts,
          fingerprint: newItem.fingerprint,
          size: newItem.size,
          keepPlain: newItem.keepPlain,
        })
      }
    }
  }

  // @override
  public async calcCatalogItem({
    plainFilepath,
    isKeepPlain = this.isKeepPlain,
  }: ICalcCatalogItemParams): Promise<IFileCipherCatalogItem | never> {
    const {
      encryptedFilesDir,
      encryptedFilePathSalt,
      maxTargetFileSize,
      partCodePrefix,
      pathResolver,
    } = this
    const absolutePlainFilepath = pathResolver.calcAbsolutePlainFilepath(plainFilepath)
    const relativePlainFilepath = pathResolver.calcRelativePlainFilepath(absolutePlainFilepath)
    const plainFilepathKey = normalizePlainFilepath(relativePlainFilepath, pathResolver)

    const fileSize = await fs.stat(absolutePlainFilepath).then(md => md.size)
    const fingerprint: string = await calcFingerprintFromFile(absolutePlainFilepath)
    const keepPlain: boolean = isKeepPlain(relativePlainFilepath)
    const cryptFilepath: string = keepPlain
      ? relativePlainFilepath
      : path.join(
          encryptedFilesDir,
          calcFingerprintFromString(encryptedFilePathSalt + plainFilepathKey, 'utf8'),
        )
    const cryptFileParts = calcFilePartNames(
      calcFilePartItemsBySize(fileSize, maxTargetFileSize),
      partCodePrefix,
    )
    const item: IFileCipherCatalogItem = {
      plainFilepath: relativePlainFilepath,
      cryptFilepath: cryptFilepath,
      cryptFileParts: cryptFileParts.length > 1 ? cryptFileParts : [],
      fingerprint,
      size: fileSize,
      keepPlain,
    }
    return item
  }

  // @override
  public async checkIntegrity({ flags }: ICheckIntegrityParams): Promise<void | never> {
    const { _itemMap, logger, pathResolver } = this
    if (flags.plainFiles) {
      logger?.debug('[checkIntegrity] checking plain files.')
      for (const item of _itemMap.values()) {
        const absolutePlainFilepath = pathResolver.calcAbsolutePlainFilepath(item.plainFilepath)
        invariant(
          isFileSync(absolutePlainFilepath),
          `[checkIntegrity] Missing plain file. (${absolutePlainFilepath})`,
        )
      }
    }

    if (flags.cryptFiles) {
      logger?.debug('[checkIntegrity] checking crypt files.')
      for (const item of _itemMap.values()) {
        if (item.cryptFileParts.length > 1) {
          for (const filePart of item.cryptFileParts) {
            const cryptFilepath = item.cryptFilepath + filePart
            const absoluteCryptFilepath = pathResolver.calcAbsoluteCryptFilepath(cryptFilepath)
            invariant(
              isFileSync(absoluteCryptFilepath),
              `[checkIntegrity] Missing crypt file part. (${absoluteCryptFilepath})`,
            )
          }
        } else {
          const absoluteCryptFilepath = pathResolver.calcAbsoluteCryptFilepath(item.cryptFilepath)
          invariant(
            isFileSync(absoluteCryptFilepath),
            `[checkIntegrity] Missing crypt file. (${absoluteCryptFilepath})`,
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
      item => item.plainFilepath,
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
  }: IDiffFromPlainFiles): Promise<IFileCipherCatalogItemDiff[]> {
    const { pathResolver, _itemMap } = this
    const addedItems: IFileCipherCatalogItemDiff[] = []
    const modifiedItems: IFileCipherCatalogItemDiff[] = []
    const removedItems: IFileCipherCatalogItemDiff[] = []
    for (const plainFilepath of plainFilepaths) {
      const key = normalizePlainFilepath(plainFilepath, pathResolver)
      const oldItem = _itemMap.get(key)
      const absolutePlainFilepath = pathResolver.calcAbsolutePlainFilepath(plainFilepath)
      const isSrcFileExists = isFileSync(absolutePlainFilepath)

      if (isSrcFileExists) {
        const newItem: IFileCipherCatalogItem = await this.calcCatalogItem({
          plainFilepath: plainFilepath,
          isKeepPlain,
        })

        if (oldItem) {
          if (!isSameFileCipherItem(oldItem, newItem)) {
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
