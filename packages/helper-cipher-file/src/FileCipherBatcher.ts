import type {
  ICatalogItem,
  IDraftCatalogItem,
  IItemForGenNonce,
} from '@guanghechen/cipher-catalog.types'
import { FileChangeTypeEnum } from '@guanghechen/cipher-catalog.types'
import type { IFileSplitter } from '@guanghechen/file-split'
import type { IFilePartItem } from '@guanghechen/filepart'
import {
  calcFilePartItemsByCount,
  calcFilePartItemsBySize,
  calcFilePartNames,
} from '@guanghechen/filepart'
import { isFileSync, mkdirsIfNotExists } from '@guanghechen/helper-fs'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import type { IReporter } from '@guanghechen/reporter.types'
import { existsSync, statSync } from 'node:fs'
import fs from 'node:fs/promises'
import type { IFileCipher } from './types/IFileCipher'
import type {
  IBatchDecryptByDiffItemsParams,
  IBatchDecryptParams,
  IBatchEncryptByDiffItemsParams,
  IBatchEncryptParams,
  IFileCipherBatcher,
} from './types/IFileCipherBatcher'
import type { IFileCipherFactory } from './types/IFileCipherFactory'

export interface IFileCipherBatcherProps {
  readonly MAX_CRYPT_FILE_SIZE: number
  readonly PART_CODE_PREFIX: string
  readonly fileCipherFactory: IFileCipherFactory
  readonly fileSplitter: IFileSplitter
  readonly reporter?: IReporter
  readonly genNonce: (item: IItemForGenNonce) => Promise<Uint8Array>
}

const clazz = 'FileCipherBatcher'

export class FileCipherBatcher implements IFileCipherBatcher {
  public readonly MAX_CRYPT_FILE_SIZE: number
  public readonly PART_CODE_PREFIX: string
  protected readonly fileSplitter: IFileSplitter
  protected readonly fileCipherFactory: IFileCipherFactory
  protected readonly reporter: IReporter | undefined
  protected readonly genNonce: (item: IItemForGenNonce) => Promise<Uint8Array>

  constructor(props: IFileCipherBatcherProps) {
    this.MAX_CRYPT_FILE_SIZE = props.MAX_CRYPT_FILE_SIZE
    this.PART_CODE_PREFIX = props.PART_CODE_PREFIX
    this.fileCipherFactory = props.fileCipherFactory
    this.fileSplitter = props.fileSplitter
    this.reporter = props.reporter
    this.genNonce = props.genNonce
  }

  public async batchEncrypt(params: IBatchEncryptParams): Promise<ICatalogItem[]> {
    const title: string = `${clazz}.batchEncrypt`
    const { draftItems, cryptPathResolver, plainPathResolver } = params
    const {
      MAX_CRYPT_FILE_SIZE,
      PART_CODE_PREFIX,
      reporter,
      fileCipherFactory,
      fileSplitter,
      genNonce,
    } = this

    const items: ICatalogItem[] = []
    for (const draftItem of draftItems) {
      const absolutePlainPath: string = plainPathResolver.resolve(draftItem.plainPath)
      if (!isFileSync(absolutePlainPath)) {
        throw new Error(
          `[${title}] Bad item, plain file does not exist or it is not a file. (${draftItem.plainPath})`,
        )
      }

      const absoluteBaseCryptPath: string = cryptPathResolver.resolve(draftItem.cryptPath)
      {
        let isCryptPathExist: boolean = false
        if (draftItem.cryptPathParts.length <= 1) {
          isCryptPathExist ||= existsSync(absoluteBaseCryptPath)
        } else {
          for (const partName of draftItem.cryptPathParts) {
            const absoluteCryptPath: string = absoluteBaseCryptPath + partName
            isCryptPathExist ||= existsSync(absoluteCryptPath)
          }
        }
        if (isCryptPathExist) {
          throw new Error(
            `[${title}] Bad draft item, crypt file already exists. (${draftItem.cryptPath})`,
          )
        }
      }

      mkdirsIfNotExists(absoluteBaseCryptPath, false, reporter)

      const nonce: Uint8Array = await genNonce({
        plainPath: draftItem.plainPath,
        fingerprint: draftItem.fingerprint,
      })
      const item: ICatalogItem = { ...draftItem, nonce, authTag: undefined }
      items.push(item)

      const parts: IFilePartItem[] = draftItem.keepIntegrity
        ? Array.from(calcFilePartItemsByCount(draftItem.size, 1))
        : Array.from(calcFilePartItemsBySize(draftItem.size, MAX_CRYPT_FILE_SIZE))

      if (draftItem.keepPlain) {
        if (parts.length <= 1) await fs.copyFile(absolutePlainPath, absoluteBaseCryptPath)
        else await fileSplitter.split(absolutePlainPath, parts, absoluteBaseCryptPath)
      } else {
        const fileCipher: IFileCipher = fileCipherFactory.fileCipher({
          iv: nonce,
          cryptPathResolver,
          plainPathResolver,
        })
        const { authTag } = await fileCipher.encryptFile({
          cryptPath: absoluteBaseCryptPath,
          plainPath: absolutePlainPath,
        })
        item.authTag = authTag

        if (parts.length > 1) {
          // Split the big crypt file.
          await fileSplitter.split(absoluteBaseCryptPath, parts)

          // Remove the original big crypt file.
          await fs.unlink(absoluteBaseCryptPath)

          const cryptPathParts: string[] = Array.from(
            calcFilePartNames(
              Array.from(calcFilePartItemsBySize(draftItem.size, MAX_CRYPT_FILE_SIZE)),
              PART_CODE_PREFIX,
            ),
          )
          item.cryptPathParts = cryptPathParts
        }
      }
    }
    return items
  }

  public async batchEncryptByDiffItems(
    params: IBatchEncryptByDiffItemsParams,
  ): Promise<ICatalogItem[]> {
    const title: string = `${clazz}.batchEncryptByDiffItems`
    const { diffItems, cryptPathResolver, plainPathResolver } = params
    const draftItems: IDraftCatalogItem[] = []

    for (const diffItem of diffItems) {
      switch (diffItem.changeType) {
        case FileChangeTypeEnum.ADDED: {
          await this._removeCryptFiles(diffItem.newItem, cryptPathResolver)
          draftItems.push(diffItem.newItem)
          break
        }
        case FileChangeTypeEnum.MODIFIED: {
          await this._removeCryptFiles(diffItem.oldItem, cryptPathResolver)
          await this._removeCryptFiles(diffItem.newItem, cryptPathResolver)
          draftItems.push(diffItem.newItem)
          break
        }
        case FileChangeTypeEnum.REMOVED: {
          await this._removeCryptFiles(diffItem.oldItem, cryptPathResolver)
          break
        }
        /* c8 ignore start */
        default:
          throw new TypeError(`[${title}] Unknown changeType: ${(diffItem as any).changeType}`)
        /* c8 ignore stop */
      }
    }

    const items: ICatalogItem[] = await this.batchEncrypt({
      draftItems,
      cryptPathResolver,
      plainPathResolver,
    })
    return items
  }

  public async batchDecrypt(params: IBatchDecryptParams): Promise<void> {
    const title: string = `${clazz}.batchDecrypt`
    const { items, cryptPathResolver, plainPathResolver } = params
    const { fileCipherFactory, fileSplitter, reporter } = this

    for (const item of items) {
      const absolutePlainPath: string = plainPathResolver.resolve(item.plainPath)
      {
        const isPlainPathExit: boolean = existsSync(absolutePlainPath)
        if (isPlainPathExit) {
          const isFile: boolean = statSync(absolutePlainPath).isFile()
          if (!isFile) {
            throw new Error(
              `[${title}] Bad item, plain file already exists and it is not a file. (${item.plainPath})`,
            )
          }
        }
      }

      const absoluteBaseCryptPath: string = cryptPathResolver.resolve(item.cryptPath)
      const absoluteCryptPaths: string[] =
        item.cryptPathParts.length <= 1
          ? [absoluteBaseCryptPath]
          : item.cryptPathParts.map(partName => absoluteBaseCryptPath + partName)

      if (absoluteCryptPaths.some(p => !isFileSync(p))) {
        throw new Error(
          `[${title}] Bad item, crypt file does not exist or it is not a file. (${item.cryptPath})`,
        )
      }

      mkdirsIfNotExists(absolutePlainPath, false, reporter)

      if (item.keepPlain) {
        await fileSplitter.merge(absoluteCryptPaths, absolutePlainPath)
      } else {
        const fileCipher = fileCipherFactory.fileCipher({
          iv: item.nonce,
          cryptPathResolver,
          plainPathResolver,
        })
        await fileCipher.decryptFiles({
          authTag: item.authTag,
          cryptPaths: absoluteCryptPaths,
          plainPath: absolutePlainPath,
        })
      }
    }
  }

  public async batchDecryptByDiffItems(params: IBatchDecryptByDiffItemsParams): Promise<void> {
    const title: string = `${clazz}.batchDecryptByDiffItems`
    const { diffItems, cryptPathResolver, plainPathResolver } = params
    const items: ICatalogItem[] = []

    for (const diffItem of diffItems) {
      switch (diffItem.changeType) {
        case FileChangeTypeEnum.ADDED: {
          await this._removePlainFiles(diffItem.newItem, plainPathResolver)
          items.push(diffItem.newItem)
          break
        }
        case FileChangeTypeEnum.MODIFIED: {
          await this._removePlainFiles(diffItem.oldItem, plainPathResolver)
          await this._removePlainFiles(diffItem.newItem, plainPathResolver)
          items.push(diffItem.newItem)
          break
        }
        case FileChangeTypeEnum.REMOVED: {
          await this._removePlainFiles(diffItem.oldItem, plainPathResolver)
          break
        }
        /* c8 ignore start */
        default:
          throw new TypeError(`[${title}] Unknown changeType: ${(diffItem as any).changeType}`)
        /* c8 ignore stop */
      }
    }

    await this.batchDecrypt({ items, cryptPathResolver, plainPathResolver })
  }

  protected async _removeCryptFiles(
    item: IDraftCatalogItem,
    cryptPathResolver: IWorkspacePathResolver,
  ): Promise<void> {
    const title: string = `${clazz}._removeCryptFiles`
    const absoluteBaseCryptPath: string = cryptPathResolver.resolve(item.cryptPath)

    if (item.cryptPathParts.length <= 1) {
      const absoluteCryptPath: string = absoluteBaseCryptPath
      await remove(absoluteCryptPath)
    } else {
      for (const part of item.cryptPathParts) {
        const absoluteCryptPath: string = absoluteBaseCryptPath + part
        await remove(absoluteCryptPath)
      }
    }

    async function remove(absoluteCryptPath: string): Promise<void> {
      if (!existsSync(absoluteCryptPath)) return

      const isFile: boolean = statSync(absoluteCryptPath).isFile()
      if (!isFile) throw new Error(`[${title}] the crypt file is not a file. (${item.cryptPath})`)

      await fs.unlink(absoluteCryptPath)
    }
  }

  protected async _removePlainFiles(
    item: IDraftCatalogItem,
    plainPathResolver: IWorkspacePathResolver,
  ): Promise<void> {
    const title: string = `${clazz}._removePlainFiles`
    const absolutePlainPath: string = plainPathResolver.resolve(item.plainPath)
    if (!existsSync(absolutePlainPath)) return

    const isFile: boolean = statSync(absolutePlainPath).isFile()
    if (!isFile) throw new Error(`[${title}] the plain file is not a file. (${item.plainPath})`)

    await fs.unlink(absolutePlainPath)
  }
}
