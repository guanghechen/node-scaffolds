import type {
  ICatalogDiffItemCombine,
  ICatalogItem,
  IDraftCatalogDiffItem,
} from '@guanghechen/cipher-catalog.types'

export function collectAffectedPlainPaths(
  diffItems: ReadonlyArray<IDraftCatalogDiffItem>,
): string[] {
  const files: Set<string> = new Set()
  const collect = (item: ICatalogItem): void => {
    files.add(item.plainPath)
  }

  for (let i = 0; i < diffItems.length; ++i) {
    const item = diffItems[i] as ICatalogDiffItemCombine
    if (item.oldItem) collect(item.oldItem)
    if (item.newItem) collect(item.newItem)
  }
  return Array.from(files)
}
