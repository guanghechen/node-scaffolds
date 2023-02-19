import type { Logger } from '@guanghechen/chalk-logger'
import type { BigFileHelper, IFilePartItem } from '@guanghechen/helper-file'
import { calcFilePartItemsBySize } from '@guanghechen/helper-file'
import { isFileSync, mkdirsIfNotExists, rm } from '@guanghechen/helper-fs'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import type { IFileCipher } from './types/IFileCipher'
import type {
  IBatchDecryptParams,
  IBatchEncryptParams,
  IFileCipherBatcher,
} from './types/IFileCipherBatcher'
import type { IFileCipherCatalogDiffItem } from './types/IFileCipherCatalogDiffItem'
import { FileChangeType } from './types/IFileCipherCatalogDiffItem'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDraft,
} from './types/IFileCipherCatalogItem'
import type { IFileCipherFactory } from './types/IFileCipherFactory'

export interface IFileCipherBatcherProps {
  fileHelper: BigFileHelper
  fileCipherFactory: IFileCipherFactory
  maxTargetFileSize: number
  logger?: Logger
}

export class FileCipherBatcher implements IFileCipherBatcher {
  public readonly fileHelper: BigFileHelper
  public readonly fileCipherFactory: IFileCipherFactory
  public readonly maxTargetFileSize: number
  protected readonly _logger?: Logger

  constructor(props: IFileCipherBatcherProps) {
    this.fileCipherFactory = props.fileCipherFactory
    this.fileHelper = props.fileHelper
    this.maxTargetFileSize = props.maxTargetFileSize
    this._logger = props.logger
  }

  public async batchEncrypt({
    strictCheck,
    plainPathResolver,
    cryptPathResolver,
    diffItems,
    getIv,
  }: IBatchEncryptParams): Promise<IFileCipherCatalogDiffItem[]> {
    const { _logger, fileCipherFactory, fileHelper, maxTargetFileSize } = this

    const add = async (
      item: IFileCipherCatalogItemDraft,
      changeType: FileChangeType,
    ): Promise<IFileCipherCatalogItem> => {
      const { plainFilepath, cryptFilepath } = item
      const absolutePlainFilepath = plainPathResolver.absolute(plainFilepath)
      invariant(
        isFileSync(absolutePlainFilepath),
        `[encryptDiff] Bad diff item (${changeType}), plain file does not exist or it is not a file. (${plainFilepath})`,
      )

      const absoluteCryptFilepath = cryptPathResolver.absolute(cryptFilepath)
      mkdirsIfNotExists(absoluteCryptFilepath, false, _logger)

      const nextItem: IFileCipherCatalogItem = { ...item, iv: '', authTag: undefined }
      if (item.keepPlain) {
        await fs.copyFile(absolutePlainFilepath, absoluteCryptFilepath)
      } else {
        const fileCipher: IFileCipher = fileCipherFactory.fileCipher({ iv: await getIv(item) })
        const { authTag } = await fileCipher.encryptFile(
          absolutePlainFilepath,
          absoluteCryptFilepath,
        )

        nextItem.iv = fileCipher.cipher.iv
        nextItem.authTag = authTag?.toString('hex')
      }

      // Split encrypted file.
      {
        const parts: IFilePartItem[] = calcFilePartItemsBySize(
          await fs.stat(absoluteCryptFilepath).then(md => md.size),
          maxTargetFileSize,
        )
        if (parts.length > 1) {
          const partFilepaths: string[] = await fileHelper.split(absoluteCryptFilepath, parts)
          const relativeCryptFilepath = cryptPathResolver.relative(cryptFilepath)

          nextItem.cryptFileParts = partFilepaths.map(p =>
            cryptPathResolver.relative(p).slice(relativeCryptFilepath.length),
          )

          // Remove the original big crypt file.
          await fs.unlink(absoluteCryptFilepath)
        }
      }
      return nextItem
    }

    const remove = async (
      item: IFileCipherCatalogItemDraft,
      changeType: FileChangeType,
    ): Promise<void> => {
      const cryptFilepaths = this._collectCryptFilepaths(item)

      // pre-check
      for (const cryptFilepath of cryptFilepaths) {
        const absoluteCryptFilepath = cryptPathResolver.absolute(cryptFilepath)
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

    const results: IFileCipherCatalogDiffItem[] = []
    for (const diffItem of diffItems) {
      const { changeType } = diffItem
      switch (changeType) {
        case FileChangeType.ADDED: {
          await this._ensureCryptPathNotExist(
            diffItem.newItem,
            strictCheck,
            cryptPathResolver,
            cryptFilepath =>
              `[encryptDiff] Bad diff item (${changeType}), crypt file already exists. (${cryptFilepath})`,
          )
          const nextNewItem = await add(diffItem.newItem, changeType)
          results.push({
            changeType: FileChangeType.ADDED,
            newItem: nextNewItem,
          })
          break
        }
        case FileChangeType.MODIFIED: {
          await remove(diffItem.oldItem, changeType)
          const nextNewItem = await add(diffItem.newItem, changeType)
          results.push({
            changeType: FileChangeType.MODIFIED,
            oldItem: diffItem.oldItem,
            newItem: nextNewItem,
          })
          break
        }
        case FileChangeType.REMOVED: {
          await this._ensurePlainPathNotExist(
            diffItem.oldItem,
            strictCheck,
            plainPathResolver,
            plainFilepath =>
              `[encryptDiff] Bad diff item (${changeType}), plain file should not exist. (${plainFilepath})`,
          )
          await remove(diffItem.oldItem, changeType)
          results.push({
            changeType: FileChangeType.REMOVED,
            oldItem: diffItem.oldItem,
          })
          break
        }
      }
    }
    return results
  }

  public async batchDecrypt({
    strictCheck,
    diffItems,
    plainPathResolver,
    cryptPathResolver,
  }: IBatchDecryptParams): Promise<void> {
    const { _logger, fileCipherFactory, fileHelper } = this

    const add = async (item: IFileCipherCatalogItem, changeType: FileChangeType): Promise<void> => {
      const cryptFilepaths = this._collectCryptFilepaths(item)
      const absoluteCryptFilepaths: string[] = []

      // pre-check
      for (const cryptFilepath of cryptFilepaths) {
        const absoluteCryptFilepath = cryptPathResolver.absolute(cryptFilepath)
        absoluteCryptFilepaths.push(absoluteCryptFilepath)

        invariant(
          isFileSync(absoluteCryptFilepath),
          `[decryptDiff] Bad diff item (${changeType}), crypt file does not exist or it is not a file. (${cryptFilepath})`,
        )
      }

      const absolutePlainFilepath = plainPathResolver.absolute(item.plainFilepath)
      mkdirsIfNotExists(absolutePlainFilepath, false, _logger)

      if (item.keepPlain) {
        await fileHelper.merge(absoluteCryptFilepaths, absolutePlainFilepath)
      } else {
        const fileCipher = fileCipherFactory.fileCipher({ iv: Buffer.from(item.iv, 'hex') })
        await fileCipher.decryptFiles(absoluteCryptFilepaths, absolutePlainFilepath, {
          authTag: item.authTag ? Buffer.from(item.authTag, 'hex') : undefined,
        })
      }
    }

    const remove = async (
      item: IFileCipherCatalogItem,
      changeType: FileChangeType,
    ): Promise<void> => {
      const { plainFilepath } = item
      const absolutePlainFilepath = plainPathResolver.absolute(plainFilepath)

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
            plainPathResolver,
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
            cryptPathResolver,
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
    plainPathResolver: FilepathResolver,
    getErrorMsg: (plainFilepath: string) => string,
  ): Promise<void> {
    const { plainFilepath } = item
    const absolutePlainFilepath = plainPathResolver.absolute(plainFilepath)
    if (strictCheck) {
      invariant(!existsSync(absolutePlainFilepath), () => getErrorMsg(plainFilepath))
    } else {
      await rm(absolutePlainFilepath)
    }
  }

  // @overridable
  protected async _ensureCryptPathNotExist(
    item: Readonly<IFileCipherCatalogItemDraft>,
    strictCheck: boolean,
    cryptPathResolver: FilepathResolver,
    getErrorMsg: (cryptFilepath: string) => string,
  ): Promise<void | never> {
    const cryptFilepaths = this._collectCryptFilepaths(item)
    for (const cryptFilepath of cryptFilepaths) {
      const absoluteCryptFilepath = cryptPathResolver.absolute(cryptFilepath)
      if (strictCheck) {
        invariant(!existsSync(absoluteCryptFilepath), () => getErrorMsg(cryptFilepath))
      } else {
        await rm(absoluteCryptFilepath)
      }
    }
  }

  protected _collectCryptFilepaths(item: Readonly<IFileCipherCatalogItemDraft>): string[] {
    return item.cryptFileParts.length > 1
      ? item.cryptFileParts.map(part => item.cryptFilepath + part)
      : [item.cryptFilepath]
  }
}
