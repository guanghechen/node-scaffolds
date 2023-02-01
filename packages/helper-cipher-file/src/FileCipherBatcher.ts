import type { Logger } from '@guanghechen/chalk-logger'
import type { BigFileHelper, IFilePartItem } from '@guanghechen/helper-file'
import { calcFilePartItemsBySize } from '@guanghechen/helper-file'
import { isFileSync, mkdirsIfNotExists, rm } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { FileChangeType } from './constant'
import type { FileCipherPathResolver } from './FileCipherPathResolver'
import type { IFileCipher } from './types/IFileCipher'
import type {
  IBatchDecryptParams,
  IBatchEncryptParams,
  IFileCipherBatcher,
} from './types/IFileCipherBatcher'
import type { IFileCipherCatalogItem } from './types/IFileCipherCatalogItem'

export interface IFileCipherBatcherProps {
  fileCipher: IFileCipher
  fileHelper: BigFileHelper
  pathResolver: FileCipherPathResolver
  maxTargetFileSize: number
  logger?: Logger
}

export class FileCipherBatcher implements IFileCipherBatcher {
  public readonly pathResolver: FileCipherPathResolver
  public readonly fileCipher: IFileCipher
  public readonly fileHelper: BigFileHelper
  public readonly maxTargetFileSize: number
  protected readonly _logger?: Logger

  constructor(props: IFileCipherBatcherProps) {
    this.pathResolver = props.pathResolver
    this.fileCipher = props.fileCipher
    this.fileHelper = props.fileHelper
    this.maxTargetFileSize = props.maxTargetFileSize
    this._logger = props.logger
  }

  public async batchEncrypt({ diffItems, strictCheck }: IBatchEncryptParams): Promise<void> {
    const { fileCipher, fileHelper, pathResolver, maxTargetFileSize } = this

    const add = async (item: IFileCipherCatalogItem, changeType: FileChangeType): Promise<void> => {
      const { sourceFilepath, encryptedFilepath } = item
      const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(sourceFilepath)
      invariant(
        isFileSync(absoluteSourceFilepath),
        `[encryptDiff] Bad diff item (${changeType}), source file does not exist or it is not a file. (${sourceFilepath})`,
      )

      const absoluteEncryptedFilepath =
        pathResolver.calcAbsoluteEncryptedFilepath(encryptedFilepath)
      mkdirsIfNotExists(absoluteEncryptedFilepath, false, this._logger)

      if (item.keepPlain) {
        await fs.copyFile(absoluteSourceFilepath, absoluteEncryptedFilepath)
      } else {
        await fileCipher.encryptFile(absoluteSourceFilepath, absoluteEncryptedFilepath)
      }

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

          // eslint-disable-next-line no-param-reassign
          item.encryptedFileParts = partFilepaths.map(p =>
            pathResolver.calcRelativeEncryptedFilepath(p).slice(relativeEncryptedFilepath.length),
          )

          // Remove the original big target file.
          await fs.unlink(absoluteEncryptedFilepath)
        }
      }
    }

    const remove = async (
      item: IFileCipherCatalogItem,
      changeType: FileChangeType,
    ): Promise<void> => {
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

  public async batchDecrypt({ diffItems, strictCheck }: IBatchDecryptParams): Promise<void> {
    const { fileCipher, fileHelper, pathResolver } = this

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
