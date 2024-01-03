import type {
  ICatalogDiffItemCombine,
  ICatalogItem,
  IDraftCatalogDiffItem,
} from '@guanghechen/cipher-catalog.types'

export function collectAffectedCryptPaths(
  diffItems: ReadonlyArray<IDraftCatalogDiffItem>,
): string[] {
  const files: Set<string> = new Set()
  const collect = (item: ICatalogItem): void => {
    if (item.cryptPathParts.length > 1) {
      for (const filePart of item.cryptPathParts) {
        files.add(item.cryptPath + filePart)
      }
    } else {
      files.add(item.cryptPath)
    }
  }

  for (let i = 0; i < diffItems.length; ++i) {
    const item = diffItems[i] as ICatalogDiffItemCombine
    if (item.oldItem) collect(item.oldItem)
    if (item.newItem) collect(item.newItem)
  }
  return Array.from(files)
}
