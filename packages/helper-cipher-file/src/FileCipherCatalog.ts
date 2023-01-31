import type { Logger } from '@guanghechen/chalk-logger'
import type { BigFileHelper, IFilePartItem } from '@guanghechen/helper-file'
import { calcFilePartItemsBySize } from '@guanghechen/helper-file'
import { isFileSync, mkdirsIfNotExists, rm } from '@guanghechen/helper-fs'
import { list2map } from '@guanghechen/helper-func'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { FileChangeType } from './constant'
import type { FileCipherPathResolver } from './FileCipherPathResolver'
import type { IFileCipher } from './types/IFileCipher'
import type {
  ICalcDiffItemsParams,
  ICheckIntegrityParams,
  IDecryptDiffParams,
  IEncryptDiffParams,
  IFileCipherCatalog,
} from './types/IFileCipherCatalog'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
} from './types/IFileCipherCatalogItem'
import { calcFileCipherCatalogItem, normalizeSourceFilepath } from './util/catalog'
import { isSameFileCipherItem } from './util/diff'

export interface IFileCipherCatalogProps {
  pathResolver: FileCipherPathResolver
  fileCipher: IFileCipher
  fileHelper: BigFileHelper
  maxTargetFileSize: number
  partCodePrefix: string
  initialItems?: IFileCipherCatalogItem[]
  logger?: Logger
  isKeepPlain(relativeSourceFilepath: string): boolean
}

export class FileCipherCatalog implements IFileCipherCatalog {
  public readonly pathResolver: FileCipherPathResolver
  public readonly fileCipher: IFileCipher
  public readonly fileHelper: BigFileHelper
  public readonly maxTargetFileSize: number
  public readonly partCodePrefix: string
  protected readonly isKeepPlain: (relativeSourceFilepath: string) => boolean
  protected readonly _logger?: Logger
  private readonly _itemMap: Map<string, IFileCipherCatalogItem>

  constructor(props: IFileCipherCatalogProps) {
    this.pathResolver = props.pathResolver
    this.fileCipher = props.fileCipher
    this.fileHelper = props.fileHelper
    this.maxTargetFileSize = props.maxTargetFileSize
    this.partCodePrefix = props.partCodePrefix
    this.isKeepPlain = props.isKeepPlain
    this._logger = props.logger
    this._itemMap = list2map(props.initialItems?.slice() ?? [], item =>
      normalizeSourceFilepath(item.sourceFilepath, this.pathResolver),
    )
  }

  public get currentItems(): IFileCipherCatalogItem[] {
    return Array.from(this._itemMap.values())
  }

  public clear(): void {
    this._itemMap.clear()
  }

  public async calcDiffItems(params: ICalcDiffItemsParams): Promise<IFileCipherCatalogItemDiff[]> {
    const { sourceFilepaths, isKeepPlain = this.isKeepPlain } = params
    const { _itemMap, pathResolver } = this
    const result: IFileCipherCatalogItemDiff[] = []
    for (const sourceFilepath of sourceFilepaths) {
      const key = normalizeSourceFilepath(sourceFilepath, pathResolver)
      const oldItem = _itemMap.get(key)
      const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(sourceFilepath)
      const relativeSourceFilepath = pathResolver.calcRelativeSourceFilepath(absoluteSourceFilepath)
      const isSrcFileExists = isFileSync(absoluteSourceFilepath)

      if (!isSrcFileExists && oldItem) {
        result.push({ changeType: FileChangeType.REMOVED, oldItem })
        continue
      }

      const newItem: IFileCipherCatalogItem = await calcFileCipherCatalogItem(sourceFilepath, {
        keepPlain: isKeepPlain(relativeSourceFilepath),
        maxTargetFileSize: this.maxTargetFileSize,
        partCodePrefix: this.partCodePrefix,
        pathResolver: this.pathResolver,
      })
      if (oldItem) {
        if (!isSameFileCipherItem(oldItem, newItem)) {
          result.push({ changeType: FileChangeType.MODIFIED, oldItem, newItem })
        }
      } else result.push({ changeType: FileChangeType.ADDED, newItem })
    }
    return result
  }

  public async checkIntegrity(params: ICheckIntegrityParams): Promise<void | never> {
    const { _itemMap, pathResolver } = this
    if (params.sourceFiles) {
      this._logger?.debug('[checkIntegrity] checking source files.')
      for (const item of _itemMap.values()) {
        const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(item.sourceFilepath)
        invariant(
          isFileSync(absoluteSourceFilepath),
          `[checkIntegrity] Missing source file. (${absoluteSourceFilepath})`,
        )
      }
    }

    if (params.encryptedFiles) {
      this._logger?.debug('[checkIntegrity] checking encrypted files.')
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

  public async encryptDiff({ diffItems, strictCheck }: IEncryptDiffParams): Promise<void> {
    const { fileCipher, fileHelper, pathResolver, maxTargetFileSize, _itemMap } = this

    const add = async (item: IFileCipherCatalogItem, changeType: FileChangeType): Promise<void> => {
      const { sourceFilepath, encryptedFilepath, fingerprint, size, keepPlain } = item
      const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(sourceFilepath)
      invariant(
        isFileSync(absoluteSourceFilepath),
        `[encryptDiff] Bad diff item (${changeType}), source file does not exist or it is not a file. (${sourceFilepath})`,
      )

      const absoluteEncryptedFilepath =
        pathResolver.calcAbsoluteEncryptedFilepath(encryptedFilepath)
      mkdirsIfNotExists(absoluteEncryptedFilepath, false, this._logger)

      if (keepPlain) {
        await fs.copyFile(absoluteSourceFilepath, absoluteEncryptedFilepath)
      } else {
        await fileCipher.encryptFile(absoluteSourceFilepath, absoluteEncryptedFilepath)
      }

      let encryptedFileParts: string[] = []

      // Split target file.
      {
        const parts: IFilePartItem[] = calcFilePartItemsBySize(
          await fs.stat(absoluteEncryptedFilepath).then(md => md.size),
          maxTargetFileSize,
        )
        if (parts.length > 1) {
          const partFilepaths: string[] = await fileHelper.split(absoluteEncryptedFilepath, parts)
          const relativeEncryptedFilepath =
            pathResolver.calcRelativeEncryptedFilepath(encryptedFilepath)
          encryptedFileParts = partFilepaths.map(p =>
            pathResolver.calcRelativeEncryptedFilepath(p).slice(relativeEncryptedFilepath.length),
          )

          // Remove the original big target file.
          await fs.unlink(absoluteEncryptedFilepath)
        }
      }

      const key = normalizeSourceFilepath(sourceFilepath, pathResolver)
      _itemMap.set(key, {
        sourceFilepath,
        encryptedFilepath,
        encryptedFileParts,
        fingerprint,
        size,
        keepPlain,
      })
    }

    const remove = async (
      item: IFileCipherCatalogItem,
      changeType: FileChangeType,
    ): Promise<void> => {
      const { sourceFilepath } = item
      const encryptedFilepaths = this._collectEncryptedFilepaths(item)

      // pre-check
      for (const encryptedFilepath of encryptedFilepaths) {
        const absoluteEncryptedFilepath =
          this.pathResolver.calcAbsoluteEncryptedFilepath(encryptedFilepath)
        if (strictCheck) {
          invariant(
            isFileSync(absoluteEncryptedFilepath),
            `[encryptDiff] Bad diff item (${changeType}), encrypted file does not exist or it is not a file. (${encryptedFilepath})`,
          )
          await fs.unlink(absoluteEncryptedFilepath)
        } else {
          await rm(absoluteEncryptedFilepath)
        }
      }

      const key = normalizeSourceFilepath(sourceFilepath, pathResolver)
      _itemMap.delete(key)
    }

    for (const diffItem of diffItems) {
      const { changeType } = diffItem
      switch (changeType) {
        case FileChangeType.ADDED: {
          await this._ensureEncryptedPathNotExist(
            diffItem.newItem,
            strictCheck,
            encryptedFilepath =>
              `[encryptDiff] Bad diff item (${changeType}), encrypted file already exists. (${encryptedFilepath})`,
          )
          await add(diffItem.newItem, changeType)
          break
        }
        case FileChangeType.MODIFIED: {
          await remove(diffItem.oldItem, changeType)
          await add(diffItem.newItem, changeType)
          break
        }
        case FileChangeType.REMOVED: {
          await this._ensureSourcePathNotExist(
            diffItem.oldItem,
            strictCheck,
            sourceFilepath =>
              `[encryptDiff] Bad diff item (${changeType}), source file should not exist. (${sourceFilepath})`,
          )
          await remove(diffItem.oldItem, changeType)
          break
        }
      }
    }
  }

  public async decryptDiff({ diffItems, strictCheck }: IDecryptDiffParams): Promise<void> {
    const { fileCipher, fileHelper, pathResolver, _itemMap } = this

    const add = async (item: IFileCipherCatalogItem, changeType: FileChangeType): Promise<void> => {
      const encryptedFilepaths = this._collectEncryptedFilepaths(item)
      const absoluteEncryptedFilepaths: string[] = []

      // pre-check
      for (const encryptedFilepath of encryptedFilepaths) {
        const absoluteEncryptedFilepath =
          pathResolver.calcAbsoluteEncryptedFilepath(encryptedFilepath)
        absoluteEncryptedFilepaths.push(absoluteEncryptedFilepath)

        invariant(
          isFileSync(absoluteEncryptedFilepath),
          `[decryptDiff] Bad diff item (${changeType}), encrypted file does not exist or it is not a file. (${encryptedFilepath})`,
        )
      }

      const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(item.sourceFilepath)
      mkdirsIfNotExists(absoluteSourceFilepath, false, this._logger)

      if (item.keepPlain) {
        await fileHelper.merge(absoluteEncryptedFilepaths, absoluteSourceFilepath)
      } else {
        await fileCipher.decryptFiles(absoluteEncryptedFilepaths, absoluteSourceFilepath)
      }

      const key = normalizeSourceFilepath(item.sourceFilepath, pathResolver)
      _itemMap.set(key, {
        sourceFilepath: item.sourceFilepath,
        encryptedFilepath: item.encryptedFilepath,
        encryptedFileParts: item.encryptedFileParts,
        fingerprint: item.fingerprint,
        size: item.size,
        keepPlain: item.keepPlain,
      })
    }

    const remove = async (
      item: IFileCipherCatalogItem,
      changeType: FileChangeType,
    ): Promise<void> => {
      const { sourceFilepath } = item
      const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(sourceFilepath)

      if (strictCheck) {
        invariant(
          isFileSync(absoluteSourceFilepath),
          `[decryptDiff] Bad diff item (${changeType}), source file does not exist or it is not a file. (${sourceFilepath})`,
        )
        await fs.unlink(absoluteSourceFilepath)
      } else {
        await rm(absoluteSourceFilepath)
      }

      const key = normalizeSourceFilepath(item.sourceFilepath, pathResolver)
      _itemMap.delete(key)
    }

    // source filepath should always pointer to the plain contents,
    // while target files indicate those encrypted contents.
    for (const diffItem of diffItems) {
      const { changeType } = diffItem
      switch (changeType) {
        case FileChangeType.ADDED: {
          await this._ensureSourcePathNotExist(
            diffItem.newItem,
            strictCheck,
            sourceFilepath =>
              `[decryptDiff] Bad diff item (${changeType}), source file already exists. (${sourceFilepath})`,
          )
          await add(diffItem.newItem, changeType)
          break
        }
        case FileChangeType.MODIFIED: {
          await remove(diffItem.oldItem, changeType)
          await add(diffItem.newItem, changeType)
          break
        }
        case FileChangeType.REMOVED: {
          await this._ensureEncryptedPathNotExist(
            diffItem.oldItem,
            strictCheck,
            encryptedFilepath =>
              `[decryptDiff] Bad diff item (REMOVED), encrypted file should not exist. (${encryptedFilepath})`,
          )
          await remove(diffItem.oldItem, changeType)
          break
        }
      }
    }
  }

  // @overridable
  protected async _ensureSourcePathNotExist(
    item: Readonly<IFileCipherCatalogItem>,
    strictCheck: boolean,
    getErrorMsg: (sourceFilepath: string) => string,
  ): Promise<void> {
    const { sourceFilepath } = item
    const absoluteSourceFilepath = this.pathResolver.calcAbsoluteSourceFilepath(sourceFilepath)
    if (strictCheck) {
      invariant(!existsSync(absoluteSourceFilepath), () => getErrorMsg(sourceFilepath))
    } else {
      await rm(absoluteSourceFilepath)
    }
  }

  // @overridable
  protected async _ensureEncryptedPathNotExist(
    item: Readonly<IFileCipherCatalogItem>,
    strictCheck: boolean,
    getErrorMsg: (encryptedFilepath: string) => string,
  ): Promise<void | never> {
    const encryptedFilepaths = this._collectEncryptedFilepaths(item)
    for (const encryptedFilepath of encryptedFilepaths) {
      const absoluteEncryptedFilepath =
        this.pathResolver.calcAbsoluteEncryptedFilepath(encryptedFilepath)
      if (strictCheck) {
        invariant(!existsSync(absoluteEncryptedFilepath), () => getErrorMsg(encryptedFilepath))
      } else {
        await rm(absoluteEncryptedFilepath)
      }
    }
  }

  protected _collectEncryptedFilepaths(item: Readonly<IFileCipherCatalogItem>): string[] {
    return item.encryptedFileParts.length > 1
      ? item.encryptedFileParts.map(part => item.encryptedFilepath + part)
      : [item.encryptedFilepath]
  }
}
