import { calcFilePartItemsBySize, calcFilePartNames } from '@guanghechen/helper-file'
import { isFileSync } from '@guanghechen/helper-fs'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import fs from 'node:fs/promises'
import type { IFileCipherCatalogContext } from '../types/IFileCipherCatalogContext'
import type { IFileCipherCatalogItemDraft } from '../types/IFileCipherCatalogItem'
import { calcFingerprintFromFile } from '../util/mac'
import { calcCryptFilepath } from './calcCryptFilepath'

export interface ICalcCatalogItemParams {
  context: IFileCipherCatalogContext
  plainFilepath: string
  plainPathResolver: FilepathResolver
}

export async function calcCatalogItem(
  params: ICalcCatalogItemParams,
): Promise<IFileCipherCatalogItemDraft> {
  const title = 'calcCatalogItem'

  const { context, plainFilepath, plainPathResolver } = params
  const absolutePlainFilepath = params.plainPathResolver.absolute(plainFilepath)
  invariant(isFileSync(absolutePlainFilepath), `[${title}] Not a file ${absolutePlainFilepath}.`)

  const fileSize = await fs.stat(absolutePlainFilepath).then(md => md.size)
  const fingerprint = await calcFingerprintFromFile(
    absolutePlainFilepath,
    context.contentHashAlgorithm,
  )
  const relativePlainFilepath = plainPathResolver.relative(absolutePlainFilepath)
  const keepPlain: boolean = context.isKeepPlain(relativePlainFilepath)

  const cryptFilepath: string = calcCryptFilepath(relativePlainFilepath, context)
  const cryptFilepathParts = calcFilePartNames(
    calcFilePartItemsBySize(fileSize, context.maxTargetFileSize),
    context.partCodePrefix,
  )

  return {
    plainFilepath: relativePlainFilepath,
    cryptFilepath,
    cryptFilepathParts: cryptFilepathParts.length > 1 ? cryptFilepathParts : [],
    fingerprint,
    keepPlain,
  }
}
