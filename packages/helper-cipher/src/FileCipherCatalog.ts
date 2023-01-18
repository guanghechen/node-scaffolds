import type { Logger } from '@guanghechen/chalk-logger'
import type { BigFileHelper, IFilePartItem } from '@guanghechen/helper-file'
import { calcFilePartItemsBySize } from '@guanghechen/helper-file'
import { list2map } from '@guanghechen/helper-func'
import { isFileSync, mkdirsIfNotExists } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import { existsSync, promises as fs } from 'node:fs'
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
      const { sourceFilepath, targetFilepath, fingerprint, size, keepPlain } = item
      const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(sourceFilepath)
      invariant(
        isFileSync(absoluteSourceFilepath),
        `[encryptDiff] Bad diff item (${changeType}), source file does not exist or it is not a file. (${sourceFilepath})`,
      )

      const absoluteTargetFilepath = pathResolver.calcAbsoluteTargetFilepath(targetFilepath)
      mkdirsIfNotExists(absoluteTargetFilepath, false, this.logger)

      if (keepPlain) {
        await fs.copyFile(absoluteSourceFilepath, absoluteTargetFilepath)
      } else {
        await fileCipher.encryptFile(absoluteSourceFilepath, absoluteTargetFilepath)
      }

      let targetParts: string[] = []

      // Split target file.
      {
        const parts: IFilePartItem[] = calcFilePartItemsBySize(
          absoluteTargetFilepath,
          maxTargetFileSize,
        )
        if (parts.length > 1) {
          const partFilepaths: string[] = await fileHelper.split(absoluteTargetFilepath, parts)
          targetParts = partFilepaths.map(p => pathResolver.calcRelativeTargetFilepath(p))

          // Remove the original big target file.
          await fs.unlink(absoluteTargetFilepath)
        }
      }

      _itemMap.set(sourceFilepath, {
        sourceFilepath,
        targetFilepath,
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
      const targetFilepaths = this._collectTargetFilepaths(item)

      // pre-check
      for (const targetFilepath of targetFilepaths) {
        const absoluteTargetFilepath = this.pathResolver.calcAbsoluteTargetFilepath(targetFilepath)
        invariant(
          isFileSync(absoluteTargetFilepath),
          `[encryptDiff] Bad diff item (${changeType}), target file does not exist or it is not a file. (${targetFilepath})`,
        )
      }

      for (const targetFilepath of targetFilepaths) {
        const absoluteTargetFilepath = this.pathResolver.calcAbsoluteTargetFilepath(targetFilepath)
        await fs.unlink(absoluteTargetFilepath)
      }
      _itemMap.delete(sourceFilepath)
    }

    for (const diffItem of diffItems) {
      const { changeType } = diffItem
      switch (changeType) {
        case FileChangeType.ADDED: {
          const { targetFilepath } = diffItem.newItem
          const absoluteTargetFilepath = pathResolver.calcAbsoluteTargetFilepath(targetFilepath)
          invariant(
            !existsSync(absoluteTargetFilepath),
            `[encryptDiff] Bad diff item (${changeType}), target file already exists. (${targetFilepath})`,
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
      const targetFilepaths = this._collectTargetFilepaths(item)
      const absoluteTargetFilepaths: string[] = []

      // pre-check
      for (const targetFilepath of targetFilepaths) {
        const absoluteTargetFilepath = pathResolver.calcAbsoluteTargetFilepath(targetFilepath)
        absoluteTargetFilepaths.push(absoluteTargetFilepath)

        invariant(
          isFileSync(absoluteTargetFilepath),
          `[decryptDiff] Bad diff item (${changeType}), target file does not exist or it is not a file. (${targetFilepath})`,
        )
      }

      const absoluteSourceFilepath = pathResolver.calcAbsoluteSourceFilepath(item.sourceFilepath)
      mkdirsIfNotExists(absoluteSourceFilepath, false, this.logger)

      if (item.keepPlain) {
        await fileHelper.merge(absoluteTargetFilepaths, absoluteSourceFilepath)
      } else {
        await fileCipher.decryptFiles(absoluteTargetFilepaths, absoluteSourceFilepath)
      }

      _itemMap.set(item.sourceFilepath, {
        sourceFilepath: item.sourceFilepath,
        targetFilepath: item.targetFilepath,
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
          const targetFilepaths = this._collectTargetFilepaths(diffItem.oldItem)
          for (const targetFilepath of targetFilepaths) {
            const absoluteTargetFilepath = pathResolver.calcAbsoluteTargetFilepath(targetFilepath)
            invariant(
              !existsSync(absoluteTargetFilepath),
              `[decryptDiff] Bad diff item (REMOVED), target file should not exist. (${targetFilepath})`,
            )
          }

          await remove(diffItem.oldItem, changeType)
          break
        }
      }
    }
  }

  protected _collectTargetFilepaths(item: Readonly<IFileCipherCatalogItem>): string[] {
    return item.targetParts.length > 1 ? item.targetParts : [item.targetFilepath]
  }
}
