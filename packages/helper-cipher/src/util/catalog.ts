import { calcFilePartItemsBySize, calcFilePartNames } from '@guanghechen/helper-file'
import { normalizeUrlPath } from '@guanghechen/helper-path'
import fs from 'node:fs/promises'
import type { FileCipherPathResolver } from '../FileCipherPathResolver'
import type { IFileCipherCatalogItem } from '../types/IFileCipherCatalogItem'
import { calcFingerprintFromFile, calcFingerprintFromString } from './mac'

export const normalizeSourceFilepath = (
  sourceFilepath: string,
  pathResolver: FileCipherPathResolver,
): string => {
  const fp = pathResolver.calcRelativeSourceFilepath(sourceFilepath).replace(/[/\\]+/, '/')
  return normalizeUrlPath(fp)
}

export const calcFileCipherCatalogItem = async (
  sourceFilepath: string,
  options: {
    keepPlain: boolean
    maxTargetSize: number
    partCodePrefix: string
    pathResolver: FileCipherPathResolver
  },
): Promise<IFileCipherCatalogItem | never> => {
  const absoluteSourceFilepath = options.pathResolver.calcAbsoluteSourceFilepath(sourceFilepath)
  const sourceFilepathKey = normalizeSourceFilepath(sourceFilepath, options.pathResolver)

  const fileSize = await fs.stat(absoluteSourceFilepath).then(md => md.size)
  const fingerprint: string = await calcFingerprintFromFile(absoluteSourceFilepath)
  const encryptedFilepath: string = calcFingerprintFromString(sourceFilepathKey, 'utf8')
  const encryptedFileParts = calcFilePartNames(
    calcFilePartItemsBySize(fileSize, options.maxTargetSize),
    options.partCodePrefix,
  )
  const item: IFileCipherCatalogItem = {
    sourceFilepath,
    encryptedFilepath,
    encryptedFileParts: encryptedFileParts.length > 1 ? encryptedFileParts : [],
    fingerprint,
    size: fileSize,
    keepPlain: options.keepPlain,
  }
  return item
}
