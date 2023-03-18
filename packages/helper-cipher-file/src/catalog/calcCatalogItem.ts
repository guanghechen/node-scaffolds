import { calcFilePartItemsBySize, calcFilePartNames } from '@guanghechen/helper-file'
import { isFileSync } from '@guanghechen/helper-fs'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import fs from 'node:fs/promises'
import type { IFileCipherCatalogItemDraft } from '../types/IFileCipherCatalogItem'
import { calcFingerprintFromFile } from '../util/mac'
import { calcCryptFilepath } from './calcCryptFilepath'

export interface ICalcCatalogItemParams {
  contentHashAlgorithm: IHashAlgorithm
  cryptFilepathSalt: string
  cryptFilesDir: string
  maxTargetFileSize: number
  partCodePrefix: string
  pathHashAlgorithm: IHashAlgorithm
  plainFilepath: string
  plainPathResolver: FilepathResolver
  // Determine if a plain file should be keep plain.
  isKeepPlain(relativePlainFilepath: string): boolean
}

export async function calcCatalogItem(
  params: ICalcCatalogItemParams,
): Promise<IFileCipherCatalogItemDraft> {
  const title = 'calcCatalogItem'
  const absolutePlainFilepath = params.plainPathResolver.absolute(params.plainFilepath)
  invariant(isFileSync(absolutePlainFilepath), `[${title}] Not a file ${absolutePlainFilepath}.`)

  const {
    contentHashAlgorithm,
    cryptFilepathSalt,
    cryptFilesDir,
    pathHashAlgorithm,
    plainPathResolver,
    isKeepPlain,
  } = params

  const fileSize = await fs.stat(absolutePlainFilepath).then(md => md.size)
  const fingerprint = await calcFingerprintFromFile(absolutePlainFilepath, contentHashAlgorithm)
  const relativePlainFilepath = plainPathResolver.relative(absolutePlainFilepath)
  const keepPlain: boolean = isKeepPlain(relativePlainFilepath)

  const cryptFilepath: string = calcCryptFilepath({
    cryptFilesDir,
    cryptFilepathSalt,
    keepPlain,
    pathHashAlgorithm,
    plainFilepath: relativePlainFilepath,
    plainPathResolver,
  })
  const cryptFilepathParts = calcFilePartNames(
    calcFilePartItemsBySize(fileSize, params.maxTargetFileSize),
    params.partCodePrefix,
  )

  return {
    plainFilepath: relativePlainFilepath,
    cryptFilepath,
    cryptFilepathParts: cryptFilepathParts.length > 1 ? cryptFilepathParts : [],
    fingerprint,
    keepPlain,
  }
}
