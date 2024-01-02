import { FileChangeTypeEnum, calcCryptPathsWithPart } from '@guanghechen/cipher-catalog'
import type {
  ICatalogDiffItem,
  ICatalogItem,
  ICipherCatalogContext,
  IDraftCatalogItem,
} from '@guanghechen/cipher-catalog'
import type { FileSplitter } from '@guanghechen/file-split'
import type { IFilePartItem } from '@guanghechen/filepart'
import { calcFilePartItemsBySize } from '@guanghechen/filepart'
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

export interface IFileCipherBatcherProps {
  readonly context: ICipherCatalogContext
  readonly fileSplitter: FileSplitter
  readonly fileCipherFactory: IFileCipherFactory
  readonly reporter?: IReporter
}

export class FileCipherBatcher implements IFileCipherBatcher {
  public readonly context: ICipherCatalogContext
  public readonly fileSplitter: FileSplitter
  public readonly fileCipherFactory: IFileCipherFactory
  public readonly reporter: IReporter | undefined

  constructor(props: IFileCipherBatcherProps) {
    this.context = props.context
    this.fileCipherFactory = props.fileCipherFactory
    this.fileSplitter = props.fileSplitter
    this.reporter = props.reporter
  }

  public async batchEncrypt(params: IBatchEncryptParams): Promise<ICatalogDiffItem[]> {
    const title = 'batchEncrypt'
    const { catalog, diffItems, strictCheck } = params
    const { cryptPathResolver, plainPathResolver } = catalog.context
    const { reporter, fileCipherFactory, fileSplitter, context } = this

    const results: ICatalogDiffItem[] = []
    for (const diffItem of diffItems) {
      const { changeType } = diffItem
      switch (changeType) {
        case FileChangeTypeEnum.ADDED: {
          await this._ensureCryptPathNotExist(
            diffItem.newItem,
            strictCheck,
            cryptPathResolver,
            cryptPath =>
              `[${title}] Bad diff item (${changeType}), crypt file already exists. (${cryptPath})`,
          )
          const nextNewItem = await add(diffItem.newItem, changeType)
          results.push({
            changeType: FileChangeTypeEnum.ADDED,
            newItem: nextNewItem,
          })
          break
        }
        case FileChangeTypeEnum.MODIFIED: {
          await remove(diffItem.oldItem, changeType)
          const nextNewItem = await add(diffItem.newItem, changeType)
          results.push({
            changeType: FileChangeTypeEnum.MODIFIED,
            oldItem: diffItem.oldItem,
            newItem: nextNewItem,
          })
          break
        }
        case FileChangeTypeEnum.REMOVED: {
          await this._ensurePlainPathNotExist(
            diffItem.oldItem,
            strictCheck,
            plainPathResolver,
            plainPath =>
              `[${title}] Bad diff item (${changeType}), plain file should not exist. (${plainPath})`,
          )
          await remove(diffItem.oldItem, changeType)
          results.push({
            changeType: FileChangeTypeEnum.REMOVED,
            oldItem: diffItem.oldItem,
          })
          break
        }
      }
    }
    return results

    async function add(
      item: IDraftCatalogItem,
      changeType: FileChangeTypeEnum,
    ): Promise<ICatalogItem> {
      const { plainPath, cryptPath } = item
      const absolutePlainPath: string = plainPathResolver.resolve(plainPath)
      invariant(
        isFileSync(absolutePlainPath),
        `[${title}.add] Bad diff item (${changeType}), plain file does not exist or it is not a file. (${plainPath})`,
      )

      const absoluteCryptPath: string = cryptPathResolver.resolve(cryptPath)
      mkdirsIfNotExists(absoluteCryptPath, false, reporter)

      const nonce: Uint8Array = await context.genNonce()
      const nextItem: ICatalogItem = { ...item, nonce, authTag: undefined }
      if (item.keepPlain) {
        await copyFile(absolutePlainPath, absoluteCryptPath)
      } else {
        const fileCipher: IFileCipher = fileCipherFactory.fileCipher({ iv: nonce })
        const { authTag } = await fileCipher.encryptFile(absolutePlainPath, absoluteCryptPath)
        nextItem.authTag = authTag
      }

      // Split encrypted file.
      {
        const parts: IFilePartItem[] = Array.from(
          calcFilePartItemsBySize(
            await stat(absoluteCryptPath).then(md => md.size),
            context.MAX_CRYPT_FILE_SIZE,
          ),
        )
        if (parts.length > 1) {
          const partFilepaths: string[] = await fileSplitter.split(absoluteCryptPath, parts)
          const relativeCryptPath: string = cryptPathResolver.relative(cryptPath)
          const cryptPathParts: string[] = partFilepaths.map(p =>
            cryptPathResolver.relative(p).slice(relativeCryptPath.length),
          )

          nextItem.cryptPathParts = cryptPathParts

          // Remove the original big crypt file.
          await unlink(absoluteCryptPath)
        }
      }
      return nextItem
    }

    async function remove(item: IDraftCatalogItem, changeType: FileChangeTypeEnum): Promise<void> {
      const cryptPaths: string[] = calcCryptPathsWithPart(item.cryptPath, item.cryptPathParts)

      // pre-check
      for (const cryptPath of cryptPaths) {
        const absoluteCryptPath = cryptPathResolver.resolve(cryptPath)
        if (strictCheck) {
          invariant(
            isFileSync(absoluteCryptPath),
            `[${title}.remove] Bad diff item (${changeType}), crypt file does not exist or it is not a file. (${cryptPath})`,
          )
          await unlink(absoluteCryptPath)
        } else {
          await rm(absoluteCryptPath)
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
        case FileChangeTypeEnum.ADDED: {
          await this._ensurePlainPathNotExist(
            diffItem.newItem,
            strictCheck,
            plainPathResolver,
            plainPath =>
              `[${title}] Bad diff item (${changeType}), plain file already exists. (${plainPath})`,
          )
          await add(diffItem.newItem, changeType)
          break
        }
        case FileChangeTypeEnum.MODIFIED: {
          await remove(diffItem.oldItem, changeType)
          await add(diffItem.newItem, changeType)
          break
        }
        case FileChangeTypeEnum.REMOVED: {
          await this._ensureCryptPathNotExist(
            diffItem.oldItem,
            strictCheck,
            cryptPathResolver,
            cryptPath =>
              `[${title}] Bad diff item (REMOVED), crypt file should not exist. (${cryptPath})`,
          )
          await remove(diffItem.oldItem, changeType)
          break
        }
      }
    }

    async function add(item: ICatalogItem, changeType: FileChangeTypeEnum): Promise<void> {
      const cryptPaths: string[] = calcCryptPathsWithPart(item.cryptPath, item.cryptPathParts)
      const absoluteCryptPaths: string[] = []

      // pre-check
      for (const cryptPath of cryptPaths) {
        const absoluteCryptPath = cryptPathResolver.resolve(cryptPath)
        absoluteCryptPaths.push(absoluteCryptPath)

        invariant(
          isFileSync(absoluteCryptPath),
          `[${title}.add] Bad diff item (${changeType}), crypt file does not exist or it is not a file. (${cryptPath})`,
        )
      }

      const absolutePlainPath = plainPathResolver.resolve(item.plainPath)
      mkdirsIfNotExists(absolutePlainPath, false, reporter)

      if (item.keepPlain) {
        await fileSplitter.merge(absoluteCryptPaths, absolutePlainPath)
      } else {
        const fileCipher = fileCipherFactory.fileCipher({ iv: item.nonce })
        await fileCipher.decryptFiles(absoluteCryptPaths, absolutePlainPath, {
          authTag: item.authTag,
        })
      }
    }

    async function remove(item: ICatalogItem, changeType: FileChangeTypeEnum): Promise<void> {
      const { plainPath } = item
      const absolutePlainPath = plainPathResolver.resolve(plainPath)

      if (strictCheck) {
        invariant(
          isFileSync(absolutePlainPath),
          `[${title}.remove] Bad diff item (${changeType}), plain file does not exist or it is not a file. (${plainPath})`,
        )
        await unlink(absolutePlainPath)
      } else {
        await rm(absolutePlainPath)
      }
    }
  }

  // @overridable
  protected async _ensurePlainPathNotExist(
    item: Readonly<ICatalogItem>,
    strictCheck: boolean,
    plainPathResolver: IWorkspacePathResolver,
    getErrorMsg: (plainPath: string) => string,
  ): Promise<void> {
    const { plainPath } = item
    const absolutePlainPath = plainPathResolver.resolve(plainPath)
    if (strictCheck) {
      invariant(!existsSync(absolutePlainPath), () => getErrorMsg(plainPath))
    } else {
      await rm(absolutePlainPath)
    }
  }

  // @overridable
  protected async _ensureCryptPathNotExist(
    item: Readonly<IDraftCatalogItem>,
    strictCheck: boolean,
    cryptPathResolver: IWorkspacePathResolver,
    getErrorMsg: (cryptPath: string) => string,
  ): Promise<void | never> {
    const cryptFilepaths: string[] = calcCryptPathsWithPart(item.cryptPath, item.cryptPathParts)
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
