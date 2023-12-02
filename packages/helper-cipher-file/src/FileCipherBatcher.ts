import { FileChangeType } from '@guanghechen/cipher-workspace.types'
import type {
  ICatalogDiffItem,
  ICatalogItem,
  IDraftCatalogItem,
} from '@guanghechen/cipher-workspace.types'
import type { FileSplitter, IFilePartItem } from '@guanghechen/file-split'
import { calcFilePartItemsBySize } from '@guanghechen/file-split'
import { isFileSync, mkdirsIfNotExists, rm } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import type { IReporter } from '@guanghechen/reporter.types'
import { existsSync } from 'node:fs'
import { copyFile, stat, unlink } from 'node:fs/promises'
import type { IFileCipher } from './types/IFileCipher'
import type {
  IBatchDecryptParams,
  IBatchEncryptParams,
  IFileCipherBatcher,
} from './types/IFileCipherBatcher'
import type { IFileCipherFactory } from './types/IFileCipherFactory'
import { calcCryptFilepathsWithParts } from './util/calcCryptFilepathsWithParts'

export interface IFileCipherBatcherProps {
  fileSplitter: FileSplitter
  fileCipherFactory: IFileCipherFactory
  maxTargetFileSize: number
  reporter?: IReporter
}

export class FileCipherBatcher implements IFileCipherBatcher {
  public readonly fileSplitter: FileSplitter
  public readonly fileCipherFactory: IFileCipherFactory
  public readonly maxTargetFileSize: number
  public readonly reporter: IReporter | undefined

  constructor(props: IFileCipherBatcherProps) {
    this.fileCipherFactory = props.fileCipherFactory
    this.fileSplitter = props.fileSplitter
    this.maxTargetFileSize = props.maxTargetFileSize
    this.reporter = props.reporter
  }

  public async batchEncrypt(params: IBatchEncryptParams): Promise<ICatalogDiffItem[]> {
    const title = 'batchEncrypt'
    const { catalog, diffItems, strictCheck } = params
    const { cryptPathResolver, plainPathResolver } = catalog.context
    const { reporter, fileCipherFactory, fileSplitter, maxTargetFileSize } = this

    const results: ICatalogDiffItem[] = []
    for (const diffItem of diffItems) {
      const { changeType } = diffItem
      switch (changeType) {
        case FileChangeType.ADDED: {
          await this._ensureCryptPathNotExist(
            diffItem.newItem,
            strictCheck,
            cryptPathResolver,
            cryptFilepath =>
              `[${title}] Bad diff item (${changeType}), crypt file already exists. (${cryptFilepath})`,
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
              `[${title}] Bad diff item (${changeType}), plain file should not exist. (${plainFilepath})`,
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

    async function add(item: IDraftCatalogItem, changeType: FileChangeType): Promise<ICatalogItem> {
      const { plainFilepath, cryptFilepath } = item
      const absolutePlainFilepath = plainPathResolver.resolve(plainFilepath)
      invariant(
        isFileSync(absolutePlainFilepath),
        `[${title}.add] Bad diff item (${changeType}), plain file does not exist or it is not a file. (${plainFilepath})`,
      )

      const absoluteCryptFilepath = cryptPathResolver.resolve(cryptFilepath)
      mkdirsIfNotExists(absoluteCryptFilepath, false, reporter)

      const nextItem: ICatalogItem = { ...item, iv: undefined, authTag: undefined }
      if (item.keepPlain) {
        await copyFile(absolutePlainFilepath, absoluteCryptFilepath)
      } else {
        const iv: Uint8Array | undefined = await catalog.getIv(item)
        const fileCipher: IFileCipher = fileCipherFactory.fileCipher({ iv })
        const { authTag } = await fileCipher.encryptFile(
          absolutePlainFilepath,
          absoluteCryptFilepath,
        )

        nextItem.iv = iv
        nextItem.authTag = authTag
      }

      // Split encrypted file.
      {
        const parts: IFilePartItem[] = calcFilePartItemsBySize(
          await stat(absoluteCryptFilepath).then(md => md.size),
          maxTargetFileSize,
        )
        if (parts.length > 1) {
          const partFilepaths: string[] = await fileSplitter.split(absoluteCryptFilepath, parts)
          const relativeCryptFilepath: string = cryptPathResolver.relative(cryptFilepath)
          const cryptFilepathParts: string[] = partFilepaths.map(p =>
            cryptPathResolver.relative(p).slice(relativeCryptFilepath.length),
          )

          nextItem.cryptFilepathParts = cryptFilepathParts

          // Remove the original big crypt file.
          await unlink(absoluteCryptFilepath)
        }
      }
      return nextItem
    }

    async function remove(item: IDraftCatalogItem, changeType: FileChangeType): Promise<void> {
      const cryptFilepaths: string[] = calcCryptFilepathsWithParts(
        item.cryptFilepath,
        item.cryptFilepathParts,
      )

      // pre-check
      for (const cryptFilepath of cryptFilepaths) {
        const absoluteCryptFilepath = cryptPathResolver.resolve(cryptFilepath)
        if (strictCheck) {
          invariant(
            isFileSync(absoluteCryptFilepath),
            `[${title}.remove] Bad diff item (${changeType}), crypt file does not exist or it is not a file. (${cryptFilepath})`,
          )
          await unlink(absoluteCryptFilepath)
        } else {
          await rm(absoluteCryptFilepath)
        }
      }
    }
  }

  public async batchDecrypt(params: IBatchDecryptParams): Promise<void> {
    const title = 'batchDecrypt'
    const { catalog, diffItems, strictCheck } = params
    const { cryptPathResolver, plainPathResolver } = catalog.context
    const { reporter, fileCipherFactory, fileSplitter } = this

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
              `[${title}] Bad diff item (${changeType}), plain file already exists. (${plainFilepath})`,
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
              `[${title}] Bad diff item (REMOVED), crypt file should not exist. (${cryptFilepath})`,
          )
          await remove(diffItem.oldItem, changeType)
          break
        }
      }
    }

    async function add(item: ICatalogItem, changeType: FileChangeType): Promise<void> {
      const cryptFilepaths: string[] = calcCryptFilepathsWithParts(
        item.cryptFilepath,
        item.cryptFilepathParts,
      )
      const absoluteCryptFilepaths: string[] = []

      // pre-check
      for (const cryptFilepath of cryptFilepaths) {
        const absoluteCryptFilepath = cryptPathResolver.resolve(cryptFilepath)
        absoluteCryptFilepaths.push(absoluteCryptFilepath)

        invariant(
          isFileSync(absoluteCryptFilepath),
          `[${title}.add] Bad diff item (${changeType}), crypt file does not exist or it is not a file. (${cryptFilepath})`,
        )
      }

      const absolutePlainFilepath = plainPathResolver.resolve(item.plainFilepath)
      mkdirsIfNotExists(absolutePlainFilepath, false, reporter)

      if (item.keepPlain) {
        await fileSplitter.merge(absoluteCryptFilepaths, absolutePlainFilepath)
      } else {
        const fileCipher = fileCipherFactory.fileCipher({ iv: item.iv })
        await fileCipher.decryptFiles(absoluteCryptFilepaths, absolutePlainFilepath, {
          authTag: item.authTag,
        })
      }
    }

    async function remove(item: ICatalogItem, changeType: FileChangeType): Promise<void> {
      const { plainFilepath } = item
      const absolutePlainFilepath = plainPathResolver.resolve(plainFilepath)

      if (strictCheck) {
        invariant(
          isFileSync(absolutePlainFilepath),
          `[${title}.remove] Bad diff item (${changeType}), plain file does not exist or it is not a file. (${plainFilepath})`,
        )
        await unlink(absolutePlainFilepath)
      } else {
        await rm(absolutePlainFilepath)
      }
    }
  }

  // @overridable
  protected async _ensurePlainPathNotExist(
    item: Readonly<ICatalogItem>,
    strictCheck: boolean,
    plainPathResolver: IWorkspacePathResolver,
    getErrorMsg: (plainFilepath: string) => string,
  ): Promise<void> {
    const { plainFilepath } = item
    const absolutePlainFilepath = plainPathResolver.resolve(plainFilepath)
    if (strictCheck) {
      invariant(!existsSync(absolutePlainFilepath), () => getErrorMsg(plainFilepath))
    } else {
      await rm(absolutePlainFilepath)
    }
  }

  // @overridable
  protected async _ensureCryptPathNotExist(
    item: Readonly<IDraftCatalogItem>,
    strictCheck: boolean,
    cryptPathResolver: IWorkspacePathResolver,
    getErrorMsg: (cryptFilepath: string) => string,
  ): Promise<void | never> {
    const cryptFilepaths: string[] = calcCryptFilepathsWithParts(
      item.cryptFilepath,
      item.cryptFilepathParts,
    )
    for (const cryptFilepath of cryptFilepaths) {
      const absoluteCryptFilepath = cryptPathResolver.resolve(cryptFilepath)
      if (strictCheck) {
        invariant(!existsSync(absoluteCryptFilepath), () => getErrorMsg(cryptFilepath))
      } else {
        await rm(absoluteCryptFilepath)
      }
    }
  }
}
