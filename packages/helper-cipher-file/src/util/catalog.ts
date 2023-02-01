import { normalizeUrlPath } from '@guanghechen/helper-path'
import type { FileCipherPathResolver } from '../FileCipherPathResolver'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
  IFileCipherCatalogItemDiffCombine,
} from '../types/IFileCipherCatalogItem'

export const normalizeSourceFilepath = (
  sourceFilepath: string,
  pathResolver: FileCipherPathResolver,
): string => {
  const fp = pathResolver.calcRelativeSourceFilepath(sourceFilepath).replace(/[/\\]+/, '/')
  return normalizeUrlPath(fp)
}

export const isSameFileCipherItem = (
  oldItem: Readonly<IFileCipherCatalogItem>,
  newItem: Readonly<IFileCipherCatalogItem>,
): boolean => {
  if (oldItem === newItem) return true

  return (
    oldItem.sourceFilepath === newItem.sourceFilepath &&
    oldItem.encryptedFilepath === newItem.encryptedFilepath &&
    oldItem.fingerprint === newItem.fingerprint &&
    oldItem.size === newItem.size &&
    oldItem.keepPlain === newItem.keepPlain
  )
}

export const collectAffectedSrcFilepaths = (
  diffItems: ReadonlyArray<IFileCipherCatalogItemDiff>,
): string[] => {
  const files: Set<string> = new Set()
  const collect = (item: IFileCipherCatalogItem): void => {
    files.add(item.sourceFilepath)
  }

  for (let i = 0; i < diffItems.length; ++i) {
    const item = diffItems[i] as IFileCipherCatalogItemDiffCombine
    if (item.oldItem) collect(item.oldItem)
    if (item.newItem) collect(item.newItem)
  }
  return Array.from(files)
}

export const collectAffectedEncFilepaths = (
  diffItems: ReadonlyArray<IFileCipherCatalogItemDiff>,
): string[] => {
  const files: Set<string> = new Set()
  const collect = (item: IFileCipherCatalogItem): void => {
    if (item.encryptedFileParts.length > 1) {
      for (const filePart of item.encryptedFileParts) {
        files.add(item.encryptedFilepath + filePart)
      }
    } else {
      files.add(item.encryptedFilepath)
    }
  }

  for (let i = 0; i < diffItems.length; ++i) {
    const item = diffItems[i] as IFileCipherCatalogItemDiffCombine
    if (item.oldItem) collect(item.oldItem)
    if (item.newItem) collect(item.newItem)
  }
  return Array.from(files)
}
