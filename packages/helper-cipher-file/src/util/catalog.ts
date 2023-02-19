import type { FilepathResolver } from '@guanghechen/helper-path'
import { normalizeUrlPath } from '@guanghechen/helper-path'
import type {
  IFileCipherCatalogDiffItemCombine,
  IFileCipherCatalogDiffItemDraft,
} from '../types/IFileCipherCatalogDiffItem'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDraft,
} from '../types/IFileCipherCatalogItem'

export function normalizePlainFilepath(
  plainFilepath: string,
  plainPathResolver: FilepathResolver,
): string {
  const fp = plainPathResolver.relative(plainFilepath)
  return normalizeUrlPath(fp)
}

export function isSameFileCipherItemDraft(
  oldItem: Readonly<IFileCipherCatalogItemDraft>,
  newItem: Readonly<IFileCipherCatalogItemDraft>,
): boolean {
  if (oldItem === newItem) return true

  return (
    oldItem.plainFilepath === newItem.plainFilepath &&
    oldItem.cryptFilepath === newItem.cryptFilepath &&
    oldItem.fingerprint === newItem.fingerprint &&
    oldItem.size === newItem.size &&
    oldItem.keepPlain === newItem.keepPlain
  )
}

export function isSameFileCipherItem(
  oldItem: Readonly<IFileCipherCatalogItem>,
  newItem: Readonly<IFileCipherCatalogItem>,
): boolean {
  if (oldItem === newItem) return true

  return (
    isSameFileCipherItemDraft(oldItem, newItem) &&
    oldItem.iv === newItem.iv &&
    oldItem.authTag === newItem.authTag
  )
}

export function collectAffectedPlainFilepaths(
  diffItems: ReadonlyArray<IFileCipherCatalogDiffItemDraft>,
): string[] {
  const files: Set<string> = new Set()
  const collect = (item: IFileCipherCatalogItem): void => {
    files.add(item.plainFilepath)
  }

  for (let i = 0; i < diffItems.length; ++i) {
    const item = diffItems[i] as IFileCipherCatalogDiffItemCombine
    if (item.oldItem) collect(item.oldItem)
    if (item.newItem) collect(item.newItem)
  }
  return Array.from(files)
}

export function collectAffectedCryptFilepaths(
  diffItems: ReadonlyArray<IFileCipherCatalogDiffItemDraft>,
): string[] {
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
    const item = diffItems[i] as IFileCipherCatalogDiffItemCombine
    if (item.oldItem) collect(item.oldItem)
    if (item.newItem) collect(item.newItem)
  }
  return Array.from(files)
}
