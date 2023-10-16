import { isFileSync } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import type { IFileCipherCatalogContext } from '../types/IFileCipherCatalogContext'
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
  context: IFileCipherCatalogContext
  oldItemMap: ReadonlyMap<string, IFileCipherCatalogItem>
  plainPathResolver: IWorkspacePathResolver
  plainFilepaths: string[]
  // Check some edge cases that shouldn't affect the final result, just for higher integrity check.
  strickCheck: boolean
}

export async function diffFromPlainFiles(
  params: IDiffFromPlainFiles,
): Promise<IFileCipherCatalogDiffItemDraft[]> {
  const { context, oldItemMap, plainFilepaths, plainPathResolver, strickCheck } = params
  const addedItems: IFileCipherCatalogDiffItemDraft[] = []
  const modifiedItems: IFileCipherCatalogDiffItemDraft[] = []
  const removedItems: IFileCipherCatalogDiffItemDraft[] = []

  for (const plainFilepath of plainFilepaths) {
    const key = normalizePlainFilepath(plainFilepath, plainPathResolver)
    const oldItem = oldItemMap.get(key)
    const absolutePlainFilepath = plainPathResolver.resolve(plainFilepath)
    const isSrcFileExists = isFileSync(absolutePlainFilepath)

    if (isSrcFileExists) {
      const newItem: IFileCipherCatalogItemDraft = await calcCatalogItem({
        context,
        plainFilepath,
        plainPathResolver,
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
