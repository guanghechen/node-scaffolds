import type {
  ICatalogDiffItemCombine,
  ICatalogItem,
  IDraftCatalogDiffItem,
} from '@guanghechen/cipher-catalog.types'

export function collectAffectedCryptFilepaths(
  diffItems: ReadonlyArray<IDraftCatalogDiffItem>,
): string[] {
  const files: Set<string> = new Set()
  const collect = (item: ICatalogItem): void => {
    if (item.cryptFilepathParts.length > 1) {
      for (const filePart of item.cryptFilepathParts) {
        files.add(item.cryptFilepath + filePart)
      }
    } else {
      files.add(item.cryptFilepath)
    }
  }

  for (let i = 0; i < diffItems.length; ++i) {
    const item = diffItems[i] as ICatalogDiffItemCombine
    if (item.oldItem) collect(item.oldItem)
    if (item.newItem) collect(item.newItem)
  }
  return Array.from(files)
}
