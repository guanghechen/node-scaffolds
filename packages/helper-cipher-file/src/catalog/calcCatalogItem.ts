import type { ICipherCatalogContext, IDraftCatalogItem } from '@guanghechen/cipher-workspace.types'
import { calcFilePartItemsBySize, calcFilePartNames } from '@guanghechen/file-split'
import { isFileSync } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import fs from 'node:fs/promises'
import { calcFingerprintFromFile } from '../util/mac'
import { calcCryptFilepath } from './calcCryptFilepath'

export interface ICalcCatalogItemParams {
  readonly context: ICipherCatalogContext
  readonly plainFilepath: string
  readonly plainPathResolver: IWorkspacePathResolver
}

export async function calcCatalogItem(params: ICalcCatalogItemParams): Promise<IDraftCatalogItem> {
  const title = 'calcCatalogItem'

  const { context, plainFilepath, plainPathResolver } = params
  const absolutePlainFilepath = plainPathResolver.resolve(plainFilepath)
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
