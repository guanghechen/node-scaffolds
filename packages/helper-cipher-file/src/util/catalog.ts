import { normalizeUrlPath } from '@guanghechen/helper-path'
import type { FileCipherPathResolver } from '../FileCipherPathResolver'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
  IFileCipherCatalogItemDiffCombine,
} from '../types/IFileCipherCatalogItem'

export const normalizePlainFilepath = (
  plainFilepath: string,
  pathResolver: FileCipherPathResolver,
): string => {
  const fp = pathResolver.calcRelativePlainFilepath(plainFilepath).replace(/[/\\]+/, '/')
  return normalizeUrlPath(fp)
}

export const isSameFileCipherItem = (
  oldItem: Readonly<IFileCipherCatalogItem>,
  newItem: Readonly<IFileCipherCatalogItem>,
): boolean => {
  if (oldItem === newItem) return true

  return (
    oldItem.plainFilepath === newItem.plainFilepath &&
    oldItem.cryptFilepath === newItem.cryptFilepath &&
    oldItem.fingerprint === newItem.fingerprint &&
    oldItem.size === newItem.size &&
    oldItem.keepPlain === newItem.keepPlain
  )
}

export const collectAffectedPlainFilepaths = (
  diffItems: ReadonlyArray<IFileCipherCatalogItemDiff>,
): string[] => {
  const files: Set<string> = new Set()
  const collect = (item: IFileCipherCatalogItem): void => {
    files.add(item.plainFilepath)
  }

  for (let i = 0; i < diffItems.length; ++i) {
    const item = diffItems[i] as IFileCipherCatalogItemDiffCombine
    if (item.oldItem) collect(item.oldItem)
    if (item.newItem) collect(item.newItem)
  }
  return Array.from(files)
}

export const collectAffectedCryptFilepaths = (
  diffItems: ReadonlyArray<IFileCipherCatalogItemDiff>,
): string[] => {
  const files: Set<string> = new Set()
  const collect = (item: IFileCipherCatalogItem): void => {
    if (item.cryptFileParts.length > 1) {
      for (const filePart of item.cryptFileParts) {
        files.add(item.cryptFilepath + filePart)
      }
    } else {
      files.add(item.cryptFilepath)
    }
  }

  for (let i = 0; i < diffItems.length; ++i) {
    const item = diffItems[i] as IFileCipherCatalogItemDiffCombine
    if (item.oldItem) collect(item.oldItem)
    if (item.newItem) collect(item.newItem)
  }
  return Array.from(files)
}
