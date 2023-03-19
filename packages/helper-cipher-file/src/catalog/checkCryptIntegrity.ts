import { isFileSync } from '@guanghechen/helper-fs'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import type { IFileCipherCatalogItemDraft } from '../types/IFileCipherCatalogItem'

export interface ICheckCryptIntegrityParams {
  items: Iterable<IFileCipherCatalogItemDraft>
  cryptFilepaths: string[]
  cryptPathResolver: FilepathResolver
}

export function checkCryptIntegrity(params: ICheckCryptIntegrityParams): void {
  const title = 'checkCryptIntegrity'
  const { cryptFilepaths, cryptPathResolver, items } = params
  const filepathSet: Set<string> = new Set(cryptFilepaths.map(p => cryptPathResolver.relative(p)))

  let count = 0
  for (const item of items) {
    if (item.cryptFilepathParts.length > 1) {
      for (const filePart of item.cryptFilepathParts) {
        const cryptFilepath = item.cryptFilepath + filePart
        const absoluteCryptFilepath = cryptPathResolver.absolute(cryptFilepath)
        count += 1

        invariant(
          filepathSet.has(cryptFilepath),
          `[${title}] Unexpected cryptFilepath. ${cryptFilepath}`,
        )
        invariant(
          isFileSync(absoluteCryptFilepath),
          `[${title}] Missing crypt file part. ${cryptFilepath})`,
        )
      }
    } else {
      const { cryptFilepath } = item
      const absoluteCryptFilepath = cryptPathResolver.absolute(cryptFilepath)
      count += 1

      invariant(
        filepathSet.has(cryptFilepath),
        `[${title}] Unexpected cryptFilepath. ${cryptFilepath}`,
      )
      invariant(
        isFileSync(absoluteCryptFilepath),
        `[${title}] Missing crypt file. ${cryptFilepath}`,
      )
    }
  }

  invariant(
    filepathSet.size === count,
    `[${title}] Count of crypt filepaths are not match. expect(${filepathSet.size}), received(${count})`,
  )
}
