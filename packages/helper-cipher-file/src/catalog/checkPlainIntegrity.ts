import type { IDraftCatalogItem } from '@guanghechen/cipher-workspace.types'
import { isFileSync } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'

export interface ICheckPlainIntegrityParams {
  items: Iterable<IDraftCatalogItem>
  plainFilepaths: string[]
  plainPathResolver: IWorkspacePathResolver
}

export function checkPlainIntegrity(params: ICheckPlainIntegrityParams): void {
  const title = 'checkPlainIntegrity'
  const { items, plainFilepaths, plainPathResolver } = params
  const filepathSet: Set<string> = new Set(plainFilepaths.map(p => plainPathResolver.relative(p)))

  let count = 0
  for (const item of items) {
    const { plainFilepath } = item
    const absolutePlainFilepath = plainPathResolver.resolve(plainFilepath)
    count += 1

    invariant(
      filepathSet.has(plainFilepath),
      `[${title}] Unexpected plainFilepath. ${plainFilepath}`,
    )
    invariant(
      isFileSync(absolutePlainFilepath),
      `[${title}] Missing plain file. (${plainFilepath})`,
    )
  }

  invariant(
    filepathSet.size === count,
    `[${title}] Count of plain filepaths are not match. expect(${filepathSet.size}), received(${count})`,
  )
}
