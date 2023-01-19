import type { Logger } from '@guanghechen/chalk-logger'
import type { BigFileHelper, IFilePartItem } from '@guanghechen/helper-file'
import { calcFilePartItemsBySize } from '@guanghechen/helper-file'
import { isFileSync, mkdirsIfNotExists } from '@guanghechen/helper-fs'
import { list2map } from '@guanghechen/helper-func'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import type { CipherPathResolver } from './CipherPathResolver'
import { FileChangeType } from './constant'
import type { IFileCipher } from './types/IFileCipher'
import type { IFileCipherCatalog } from './types/IFileCipherCatalog'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
} from './types/IFileCipherCatalogItem'

export interface IFileCipherCatalogProps {
  pathResolver: CipherPathResolver
  fileCipher: IFileCipher
  fileHelper: BigFileHelper
  maxTargetFileSize: number
  initialItems?: IFileCipherCatalogItem[]
  logger?: Logger
}

export class FileCipherCatalog implements IFileCipherCatalog {
  public readonly pathResolver: CipherPathResolver
  public readonly fileCipher: IFileCipher
  public readonly fileHelper: BigFileHelper
  public readonly maxTargetFileSize: number
  protected readonly logger?: Logger
  private readonly _itemMap: Map<string, IFileCipherCatalogItem>

  constructor(props: IFileCipherCatalogProps) {
    this.pathResolver = props.pathResolver
    this.fileCipher = props.fileCipher
    this.fileHelper = props.fileHelper
    this.maxTargetFileSize = props.maxTargetFileSize
    this._itemMap = list2map(props.initialItems?.slice() ?? [], item => item.sourceFilepath)
  }

  public get currentItems(): IFileCipherCatalogItem[] {
    return Array.from(this._itemMap.values())
  }

  public checkIntegrity(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public async encryptDiff(diffItems: ReadonlyArray<IFileCipherCatalogItemDiff>): Promise<void> {
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
      mkdirsIfNotExists(absoluteEncryptedFilepath, false, this.logger)

      if (keepPlain) {
        await fs.copyFile(absoluteSourceFilepath, absoluteEncryptedFilepath)
      } else {
        await fileCipher.encryptFile(absoluteSourceFilepath, absoluteEncryptedFilepath)
      }

      let targetParts: string[] = []

      // Split target file.
      {
        const parts: IFilePartItem[] = calcFilePartItemsBySize(
          absoluteEncryptedFilepath,
          maxTargetFileSize,
        )
        if (parts.length > 1) {
          const partFilepaths: string[] = await fileHelper.split(absoluteEncryptedFilepath, parts)
          targetParts = partFilepaths.map(p => pathResolver.calcRelativeEncryptedFilepath(p))

          // Remove the original big target file.
          await fs.unlink(absoluteEncryptedFilepath)
        }
      }

      _itemMap.set(sourceFilepath, {
        sourceFilepath,
        encryptedFilepath,
        targetParts,
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
        invariant(
          isFileSync(absoluteEncryptedFilepath),
          `[encryptDiff] Bad diff item (${changeType}), encrypted file does not exist or it is not a file. (${encryptedFilepath})`,
        )
      }

      for (const encryptedFilepath of encryptedFilepaths) {
        const absoluteEncryptedFilepath =
          this.pathResolver.calcAbsoluteEncryptedFilepath(encryptedFilepath)
        await fs.unlink(absoluteEncryptedFilepath)
      }
      _itemMap.delete(sourceFilepath)
    }

    for (const diffItem of diffItems) {
      const { changeType } = diffItem
      switch (changeType) {
        case FileChangeType.ADDED: {
          const { encryptedFilepath } = diffItem.newItem
          const absoluteEncryptedFilepath =
            pathResolver.calcAbsoluteEncryptedFilepath(encryptedFilepath)
          invariant(
            !existsSync(absoluteEncryptedFilepath),
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
          const { sourceFilepath } = diffItem.oldItem
          const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(sourceFilepath)
          invariant(
            !existsSync(absoluteSourceFilepath),
            `[encryptDiff] Bad diff item (${changeType}), source file should not exist. (${sourceFilepath})`,
          )

          await remove(diffItem.oldItem, changeType)
          break
        }
      }
    }
  }

  public async decryptDiff(diffItems: ReadonlyArray<IFileCipherCatalogItemDiff>): Promise<void> {
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
      mkdirsIfNotExists(absoluteSourceFilepath, false, this.logger)

      if (item.keepPlain) {
        await fileHelper.merge(absoluteEncryptedFilepaths, absoluteSourceFilepath)
      } else {
        await fileCipher.decryptFiles(absoluteEncryptedFilepaths, absoluteSourceFilepath)
      }

      _itemMap.set(item.sourceFilepath, {
        sourceFilepath: item.sourceFilepath,
        encryptedFilepath: item.encryptedFilepath,
        targetParts: item.targetParts,
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

      invariant(
        isFileSync(absoluteSourceFilepath),
        `[decryptDiff] Bad diff item (${changeType}), source file does not exist or it is not a file. (${sourceFilepath})`,
      )

      await fs.unlink(absoluteSourceFilepath)

      _itemMap.delete(sourceFilepath)
    }

    // source filepath should always pointer to the plain contents,
    // while target files indicate those encrypted contents.
    for (const diffItem of diffItems) {
      const { changeType } = diffItem
      switch (changeType) {
        case FileChangeType.ADDED: {
          const { sourceFilepath } = diffItem.newItem
          const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(sourceFilepath)
          invariant(
            !existsSync(absoluteSourceFilepath),
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
          const encryptedFilepaths = this._collectEncryptedFilepaths(diffItem.oldItem)
          for (const encryptedFilepath of encryptedFilepaths) {
            const absoluteEncryptedFilepath =
              pathResolver.calcAbsoluteEncryptedFilepath(encryptedFilepath)
            invariant(
              !existsSync(absoluteEncryptedFilepath),
              `[decryptDiff] Bad diff item (REMOVED), encrypted file should not exist. (${encryptedFilepath})`,
            )
          }

          await remove(diffItem.oldItem, changeType)
          break
        }
      }
    }
  }

  protected _collectEncryptedFilepaths(item: Readonly<IFileCipherCatalogItem>): string[] {
    return item.targetParts.length > 1 ? item.targetParts : [item.encryptedFilepath]
  }
}
