import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import type { FilepathResolver } from '@guanghechen/helper-path'
import path from 'node:path'
import { calcFingerprintFromString } from '../util/mac'
import { normalizePlainFilepath } from './normalizePlainFilepath'

export interface ICalcCryptFilepathParams {
  cryptFilepathSalt: string
  cryptFilesDir: string
  keepPlain: boolean
  pathHashAlgorithm: IHashAlgorithm
  plainFilepath: string
  plainPathResolver: FilepathResolver
}

export function calcCryptFilepath(params: ICalcCryptFilepathParams): string {
  const {
    cryptFilepathSalt,
    cryptFilesDir,
    keepPlain,
    pathHashAlgorithm,
    plainFilepath,
    plainPathResolver,
  } = params
  const absolutePlainFilepath = plainPathResolver.absolute(plainFilepath)
  const relativePlainFilepath = plainPathResolver.relative(absolutePlainFilepath)
  const plainFilepathKey = normalizePlainFilepath(relativePlainFilepath, plainPathResolver)
  const cryptFilepath: string = keepPlain
    ? relativePlainFilepath
    : path.join(
        cryptFilesDir,
        calcFingerprintFromString(cryptFilepathSalt + plainFilepathKey, 'utf8', pathHashAlgorithm),
      )
  return cryptFilepath
}

export function calcCryptFilepaths(cryptFilepath: string, cryptFilepathParts: string[]): string[] {
  return cryptFilepathParts.length > 1
    ? cryptFilepathParts.map(part => cryptFilepath + part)
    : [cryptFilepath]
}
