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
    maxTargetFileSize: number
    partCodePrefix: string
    pathResolver: FileCipherPathResolver
  },
): Promise<IFileCipherCatalogItem | never> => {
  const absoluteSourceFilepath = options.pathResolver.calcAbsoluteSourceFilepath(sourceFilepath)
  const relativeSourceFilepath =
    options.pathResolver.calcRelativeSourceFilepath(absoluteSourceFilepath)
  const sourceFilepathKey = normalizeSourceFilepath(relativeSourceFilepath, options.pathResolver)

  const fileSize = await fs.stat(absoluteSourceFilepath).then(md => md.size)
  const fingerprint: string = await calcFingerprintFromFile(absoluteSourceFilepath)
  const encryptedFilepath: string = options.keepPlain
    ? relativeSourceFilepath
    : calcFingerprintFromString(sourceFilepathKey, 'utf8')
  const encryptedFileParts = calcFilePartNames(
    calcFilePartItemsBySize(fileSize, options.maxTargetFileSize),
    options.partCodePrefix,
  )
  const item: IFileCipherCatalogItem = {
    sourceFilepath: relativeSourceFilepath,
    encryptedFilepath,
    encryptedFileParts: encryptedFileParts.length > 1 ? encryptedFileParts : [],
    fingerprint,
    size: fileSize,
    keepPlain: options.keepPlain,
  }
  return item
}
