import type { FilepathResolver } from '@guanghechen/helper-path'
import { normalizeUrlPath } from '@guanghechen/helper-path'

export function normalizePlainFilepath(
  plainFilepath: string,
  plainPathResolver: FilepathResolver,
): string {
  const relativePlainFilepath = plainPathResolver.relative(plainFilepath)
  return normalizeRelativePlainFilepath(relativePlainFilepath)
}

export function normalizeRelativePlainFilepath(relativePlainFilepath: string): string {
  return normalizeUrlPath(relativePlainFilepath)
}
