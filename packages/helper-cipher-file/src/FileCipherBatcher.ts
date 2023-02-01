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
    const { _logger, fileCipher, fileHelper, pathResolver, maxTargetFileSize } = this

    const add = async (item: IFileCipherCatalogItem, changeType: FileChangeType): Promise<void> => {
      const { plainFilepath, cryptFilepath } = item
      const absolutePlainFilepath = pathResolver.calcAbsolutePlainFilepath(plainFilepath)
      invariant(
        isFileSync(absolutePlainFilepath),
        `[encryptDiff] Bad diff item (${changeType}), plain file does not exist or it is not a file. (${plainFilepath})`,
      )

      const absoluteCryptFilepath = pathResolver.calcAbsoluteCryptFilepath(cryptFilepath)
      mkdirsIfNotExists(absoluteCryptFilepath, false, _logger)

      if (item.keepPlain) {
        await fs.copyFile(absolutePlainFilepath, absoluteCryptFilepath)
      } else {
        await fileCipher.encryptFile(absolutePlainFilepath, absoluteCryptFilepath)
      }

      // Split encrypted file.
      {
        const parts: IFilePartItem[] = calcFilePartItemsBySize(
          await fs.stat(absoluteCryptFilepath).then(md => md.size),
          maxTargetFileSize,
        )
        if (parts.length > 1) {
          const partFilepaths: string[] = await fileHelper.split(absoluteCryptFilepath, parts)
          const relativeCryptFilepath = pathResolver.calcRelativeCryptFilepath(cryptFilepath)

          // eslint-disable-next-line no-param-reassign
          item.cryptFileParts = partFilepaths.map(p =>
            pathResolver.calcRelativeCryptFilepath(p).slice(relativeCryptFilepath.length),
          )

          // Remove the original big crypt file.
          await fs.unlink(absoluteCryptFilepath)
        }
      }
    }

    const remove = async (
      item: IFileCipherCatalogItem,
      changeType: FileChangeType,
    ): Promise<void> => {
      const cryptFilepaths = this._collectCryptFilepaths(item)

      // pre-check
      for (const cryptFilepath of cryptFilepaths) {
        const absoluteCryptFilepath = pathResolver.calcAbsoluteCryptFilepath(cryptFilepath)
        if (strictCheck) {
          invariant(
            isFileSync(absoluteCryptFilepath),
            `[encryptDiff] Bad diff item (${changeType}), crypt file does not exist or it is not a file. (${cryptFilepath})`,
          )
          await fs.unlink(absoluteCryptFilepath)
        } else {
          await rm(absoluteCryptFilepath)
        }
      }
    }

    for (const diffItem of diffItems) {
      const { changeType } = diffItem
      switch (changeType) {
        case FileChangeType.ADDED: {
          await this._ensureCryptPathNotExist(
            diffItem.newItem,
            strictCheck,
            cryptFilepath =>
              `[encryptDiff] Bad diff item (${changeType}), crypt file already exists. (${cryptFilepath})`,
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
          await this._ensurePlainPathNotExist(
            diffItem.oldItem,
            strictCheck,
            plainFilepath =>
              `[encryptDiff] Bad diff item (${changeType}), plain file should not exist. (${plainFilepath})`,
          )
          await remove(diffItem.oldItem, changeType)
          break
        }
      }
    }
  }

  public async batchDecrypt({ diffItems, strictCheck }: IBatchDecryptParams): Promise<void> {
    const { _logger, fileCipher, fileHelper, pathResolver } = this

    const add = async (item: IFileCipherCatalogItem, changeType: FileChangeType): Promise<void> => {
      const cryptFilepaths = this._collectCryptFilepaths(item)
      const absoluteCryptFilepaths: string[] = []

      // pre-check
      for (const cryptFilepath of cryptFilepaths) {
        const absoluteCryptFilepath = pathResolver.calcAbsoluteCryptFilepath(cryptFilepath)
        absoluteCryptFilepaths.push(absoluteCryptFilepath)

        invariant(
          isFileSync(absoluteCryptFilepath),
          `[decryptDiff] Bad diff item (${changeType}), crypt file does not exist or it is not a file. (${cryptFilepath})`,
        )
      }

      const absolutePlainFilepath = pathResolver.calcAbsolutePlainFilepath(item.plainFilepath)
      mkdirsIfNotExists(absolutePlainFilepath, false, _logger)

      if (item.keepPlain) {
        await fileHelper.merge(absoluteCryptFilepaths, absolutePlainFilepath)
      } else {
        await fileCipher.decryptFiles(absoluteCryptFilepaths, absolutePlainFilepath)
      }
    }

    const remove = async (
      item: IFileCipherCatalogItem,
      changeType: FileChangeType,
    ): Promise<void> => {
      const { plainFilepath } = item
      const absolutePlainFilepath = pathResolver.calcAbsolutePlainFilepath(plainFilepath)

      if (strictCheck) {
        invariant(
          isFileSync(absolutePlainFilepath),
          `[decryptDiff] Bad diff item (${changeType}), plain file does not exist or it is not a file. (${plainFilepath})`,
        )
        await fs.unlink(absolutePlainFilepath)
      } else {
        await rm(absolutePlainFilepath)
      }
    }

    // Plain filepath should always pointer to the plain contents,
    // while crypt files indicate those encrypted contents.
    for (const diffItem of diffItems) {
      const { changeType } = diffItem
      switch (changeType) {
        case FileChangeType.ADDED: {
          await this._ensurePlainPathNotExist(
            diffItem.newItem,
            strictCheck,
            plainFilepath =>
              `[decryptDiff] Bad diff item (${changeType}), plain file already exists. (${plainFilepath})`,
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
          await this._ensureCryptPathNotExist(
            diffItem.oldItem,
            strictCheck,
            cryptFilepath =>
              `[decryptDiff] Bad diff item (REMOVED), crypt file should not exist. (${cryptFilepath})`,
          )
          await remove(diffItem.oldItem, changeType)
          break
        }
      }
    }
  }

  // @overridable
  protected async _ensurePlainPathNotExist(
    item: Readonly<IFileCipherCatalogItem>,
    strictCheck: boolean,
    getErrorMsg: (plainFilepath: string) => string,
  ): Promise<void> {
    const { plainFilepath } = item
    const absolutePlainFilepath = this.pathResolver.calcAbsolutePlainFilepath(plainFilepath)
    if (strictCheck) {
      invariant(!existsSync(absolutePlainFilepath), () => getErrorMsg(plainFilepath))
    } else {
      await rm(absolutePlainFilepath)
    }
  }

  // @overridable
  protected async _ensureCryptPathNotExist(
    item: Readonly<IFileCipherCatalogItem>,
    strictCheck: boolean,
    getErrorMsg: (cryptFilepath: string) => string,
  ): Promise<void | never> {
    const cryptFilepaths = this._collectCryptFilepaths(item)
    for (const cryptFilepath of cryptFilepaths) {
      const absoluteCryptFilepath = this.pathResolver.calcAbsoluteCryptFilepath(cryptFilepath)
      if (strictCheck) {
        invariant(!existsSync(absoluteCryptFilepath), () => getErrorMsg(cryptFilepath))
      } else {
        await rm(absoluteCryptFilepath)
      }
    }
  }

  protected _collectCryptFilepaths(item: Readonly<IFileCipherCatalogItem>): string[] {
    return item.cryptFileParts.length > 1
      ? item.cryptFileParts.map(part => item.cryptFilepath + part)
      : [item.cryptFilepath]
  }
}
