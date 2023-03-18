import type {
  IFileCipherCatalogDiffItemCombine,
  IFileCipherCatalogDiffItemDraft,
} from '../types/IFileCipherCatalogDiffItem'
import type { IFileCipherCatalogItem } from '../types/IFileCipherCatalogItem'

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
