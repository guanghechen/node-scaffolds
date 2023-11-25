import type { ICipherCatalogContext } from '@guanghechen/cipher-workspace.types'
import invariant from '@guanghechen/invariant'
import path from 'node:path'
import { calcFingerprintFromString } from '../util/mac'
import { normalizePlainFilepath } from './normalizePlainFilepath'

export function calcCryptFilepath(
  relativePlainFilepath: string,
  context: ICipherCatalogContext,
): string {
  invariant(
    !path.isAbsolute(relativePlainFilepath),
    `[calcCryptFilepath] relativePlainFilepath should be a relative path. received(${relativePlainFilepath})`,
  )

  const plainFilepathKey: string = normalizePlainFilepath(
    relativePlainFilepath,
    context.plainPathResolver,
  )
  const cryptFilepath: string = context.isKeepPlain(relativePlainFilepath)
    ? relativePlainFilepath
    : path.join(
        context.cryptFilesDir,
        calcFingerprintFromString(
          context.cryptFilepathSalt + plainFilepathKey,
          'utf8',
          context.pathHashAlgorithm,
        ),
      )
  return cryptFilepath
}

export function calcCryptFilepaths(cryptFilepath: string, cryptFilepathParts: string[]): string[] {
  return cryptFilepathParts.length > 1
    ? cryptFilepathParts.map(part => cryptFilepath + part)
    : [cryptFilepath]
}
