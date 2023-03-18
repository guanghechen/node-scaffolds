import type { FilepathResolver } from '@guanghechen/helper-path'
import { normalizeUrlPath } from '@guanghechen/helper-path'

export function normalizePlainFilepath(
  plainFilepath: string,
  plainPathResolver: FilepathResolver,
): string {
  const fp = plainPathResolver.relative(plainFilepath)
  return normalizeUrlPath(fp)
}
