import type { Logger } from '@guanghechen/chalk-logger'
import { calcFilePartItemsBySize, calcFilePartNames } from '@guanghechen/helper-file'
import { isFileSync } from '@guanghechen/helper-fs'
import { list2map, mapIterable } from '@guanghechen/helper-func'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import fs from 'node:fs/promises'
import path from 'node:path'
import type {
  ICalcCatalogItemParams,
  ICheckCryptIntegrityParams,
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
  IFileCipherCatalogItemBase,
  IFileCipherCatalogItemDraft,
} from './types/IFileCipherCatalogItem'
import {
  isSameFileCipherItem,
  isSameFileCipherItemDraft,
  normalizePlainFilepath,
} from './util/catalog'
import { calcFingerprintFromFile, calcFingerprintFromString } from './util/mac'

export interface IFileCipherCatalogProps {
  plainPathResolver: FilepathResolver
  maxTargetFileSize: number
  partCodePrefix: string
  cryptFilesDir: string
  cryptFilepathSalt: string
  contentHashAlgorithm: IHashAlgorithm
  pathHashAlgorithm: IHashAlgorithm
  logger?: Logger
  isKeepPlain(relativePlainFilepath: string): boolean
}

export class FileCipherCatalog implements IFileCipherCatalog {
  public readonly plainPathResolver: FilepathResolver
  public readonly maxTargetFileSize: number
  public readonly partCodePrefix: string
  public readonly cryptFilesDir: string
  public readonly cryptFilepathSalt: string
  public readonly contentHashAlgorithm: IHashAlgorithm
  public readonly pathHashAlgorithm: IHashAlgorithm
  protected readonly logger?: Logger
  protected readonly isKeepPlain: (relativePlainFilepath: string) => boolean
  protected readonly _itemMap: Map<string, IFileCipherCatalogItem>

  constructor(props: IFileCipherCatalogProps) {
    invariant(
      !path.isAbsolute(props.cryptFilesDir),
      `[FileCipherCatalog.constructor] cryptFilesDir should be a relative path. received(${props.cryptFilesDir})`,
    )

    this.plainPathResolver = props.plainPathResolver
    this.maxTargetFileSize = props.maxTargetFileSize
    this.partCodePrefix = props.partCodePrefix
    this.cryptFilesDir = props.cryptFilesDir
    this.cryptFilepathSalt = props.cryptFilepathSalt
    this.contentHashAlgorithm = props.contentHashAlgorithm
    this.pathHashAlgorithm = props.pathHashAlgorithm
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
    const { _itemMap, plainPathResolver } = this
    _itemMap.clear()
    if (items) {
      for (const item of items) {
        const key: string = normalizePlainFilepath(item.plainFilepath, plainPathResolver)
        _itemMap.set(key, item)
      }
    }
  }

  // @override
  public applyDiff(diffItems: Iterable<IFileCipherCatalogDiffItem>): void {
    const { _itemMap, plainPathResolver } = this
    for (const diffItem of diffItems) {
      const { oldItem, newItem } = diffItem as IFileCipherCatalogDiffItemCombine
      if (oldItem) {
        const key = normalizePlainFilepath(oldItem.plainFilepath, plainPathResolver)
        _itemMap.delete(key)
      }
      if (newItem) {
        const key = normalizePlainFilepath(newItem.plainFilepath, plainPathResolver)
        _itemMap.set(key, {
          plainFilepath: newItem.plainFilepath,
          cryptFilepath: newItem.cryptFilepath,
          cryptFileParts: newItem.cryptFileParts,
          fingerprint: newItem.fingerprint,
          size: newItem.size,
          keepPlain: newItem.keepPlain,
          iv: newItem.iv,
          authTag: newItem.authTag,
        })
      }
    }
  }

  // @override
  public async calcCatalogItem({
    plainFilepath,
    isKeepPlain = this.isKeepPlain,
  }: ICalcCatalogItemParams): Promise<IFileCipherCatalogItemDraft | never> {
    const { plainPathResolver, contentHashAlgorithm } = this
    const absolutePlainFilepath = plainPathResolver.absolute(plainFilepath)
    invariant(isFileSync(absolutePlainFilepath), `Not a file ${absolutePlainFilepath}.`)

    const fingerprint = await calcFingerprintFromFile(absolutePlainFilepath, contentHashAlgorithm)
    const fileSize = await fs.stat(absolutePlainFilepath).then(md => md.size)
    const relativePlainFilepath = plainPathResolver.relative(absolutePlainFilepath)
    const keepPlain: boolean = isKeepPlain(relativePlainFilepath)

    return this.flatCatalogItem({
      fingerprint,
      size: fileSize,
      plainFilepath: relativePlainFilepath,
      keepPlain,
    })
  }

  // override
  public flatCatalogItem({
    plainFilepath,
    fingerprint,
    size,
    keepPlain,
  }: IFileCipherCatalogItemBase): IFileCipherCatalogItemDraft {
    const { cryptFilesDir, cryptFilepathSalt, plainPathResolver } = this
    const plainFilepathKey = normalizePlainFilepath(plainFilepath, plainPathResolver)

    const cryptFilepath: string = keepPlain
      ? plainFilepath
      : path.join(
          cryptFilesDir,
          calcFingerprintFromString(
            cryptFilepathSalt + plainFilepathKey,
            'utf8',
            this.pathHashAlgorithm,
          ),
        )
    const cryptFileParts = calcFilePartNames(
      calcFilePartItemsBySize(size, this.maxTargetFileSize),
      this.partCodePrefix,
    )
    const item: IFileCipherCatalogItemDraft = {
      plainFilepath,
      cryptFilepath,
      cryptFileParts: cryptFileParts.length > 1 ? cryptFileParts : [],
      fingerprint,
      size: size,
      keepPlain,
    }
    return item
  }

  // @override
  public async checkPlainIntegrity(): Promise<void | never> {
    const { _itemMap, logger, plainPathResolver } = this
    logger?.debug('[checkIntegrity] checking plain files.')
    for (const item of _itemMap.values()) {
      const absolutePlainFilepath = plainPathResolver.absolute(item.plainFilepath)
      invariant(
        isFileSync(absolutePlainFilepath),
        `[checkIntegrity] Missing plain file. (${absolutePlainFilepath})`,
      )
    }
  }

  // @override
  public async checkCryptIntegrity({
    cryptPathResolver,
  }: ICheckCryptIntegrityParams): Promise<void | never> {
    const { _itemMap, logger } = this
    logger?.debug('[checkIntegrity] checking crypt files.')
    for (const item of _itemMap.values()) {
      if (item.cryptFileParts.length > 1) {
        for (const filePart of item.cryptFileParts) {
          const cryptFilepath = item.cryptFilepath + filePart
          const absoluteCryptFilepath = cryptPathResolver.absolute(cryptFilepath)
          invariant(
            isFileSync(absoluteCryptFilepath),
            `[checkIntegrity] Missing crypt file part. (${absoluteCryptFilepath})`,
          )
        }
      } else {
        const absoluteCryptFilepath = cryptPathResolver.absolute(item.cryptFilepath)
        invariant(
          isFileSync(absoluteCryptFilepath),
          `[checkIntegrity] Missing crypt file. (${absoluteCryptFilepath})`,
        )
      }
    }
  }

  // @override
  public diffFromCatalogItems({
    newItems,
  }: IDiffFromCatalogItemsParams): IFileCipherCatalogDiffItem[] {
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
    const { plainPathResolver, _itemMap } = this
    const addedItems: IFileCipherCatalogDiffItemDraft[] = []
    const modifiedItems: IFileCipherCatalogDiffItemDraft[] = []
    const removedItems: IFileCipherCatalogDiffItemDraft[] = []
    for (const plainFilepath of plainFilepaths) {
      const key = normalizePlainFilepath(plainFilepath, plainPathResolver)
      const oldItem = _itemMap.get(key)
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
