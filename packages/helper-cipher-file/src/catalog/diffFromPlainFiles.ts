import { isFileSync } from '@guanghechen/helper-fs'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import type { IFileCipherCatalogDiffItemDraft } from '../types/IFileCipherCatalogDiffItem'
import { FileChangeType } from '../types/IFileCipherCatalogDiffItem'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDraft,
} from '../types/IFileCipherCatalogItem'
import { calcCatalogItem } from './calcCatalogItem'
import { isSameFileCipherItemDraft } from './isSameFileCipherItem'
import { normalizePlainFilepath } from './normalizePlainFilepath'

export interface IDiffFromPlainFiles {
  contentHashAlgorithm: IHashAlgorithm
  cryptFilepathSalt: string
  cryptFilesDir: string
  maxTargetFileSize: number
  oldItemMap: ReadonlyMap<string, IFileCipherCatalogItem>
  partCodePrefix: string
  pathHashAlgorithm: IHashAlgorithm
  plainPathResolver: FilepathResolver
  plainFilepaths: string[]
  // Check some edge cases that shouldn't affect the final result, just for higher integrity check.
  strickCheck: boolean
  // Determine if a plain file should be keep plain.
  isKeepPlain(relativePlainFilepath: string): boolean
}

export async function diffFromPlainFiles(
  params: IDiffFromPlainFiles,
): Promise<IFileCipherCatalogDiffItemDraft[]> {
  const {
    contentHashAlgorithm,
    cryptFilepathSalt,
    cryptFilesDir,
    maxTargetFileSize,
    oldItemMap,
    partCodePrefix,
    pathHashAlgorithm,
    plainFilepaths,
    plainPathResolver,
    strickCheck,
    isKeepPlain,
  } = params

  const addedItems: IFileCipherCatalogDiffItemDraft[] = []
  const modifiedItems: IFileCipherCatalogDiffItemDraft[] = []
  const removedItems: IFileCipherCatalogDiffItemDraft[] = []

  for (const plainFilepath of plainFilepaths) {
    const key = normalizePlainFilepath(plainFilepath, plainPathResolver)
    const oldItem = oldItemMap.get(key)
    const absolutePlainFilepath = plainPathResolver.absolute(plainFilepath)
    const isSrcFileExists = isFileSync(absolutePlainFilepath)

    if (isSrcFileExists) {
      const newItem: IFileCipherCatalogItemDraft = await calcCatalogItem({
        contentHashAlgorithm,
        cryptFilepathSalt,
        cryptFilesDir,
        maxTargetFileSize,
        partCodePrefix,
        pathHashAlgorithm,
        plainFilepath,
        plainPathResolver,
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
