import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import { FileSplitter } from '@guanghechen/file-split'
import type { IFileCipherCatalogContext, IFileCipherFactory } from '@guanghechen/helper-cipher-file'
import { FileCipherBatcher, FileCipherFactory } from '@guanghechen/helper-cipher-file'
import type { IGitCipherContext } from '@guanghechen/helper-git-cipher'
import { GitCipherConfigKeeper, GitCipherContext } from '@guanghechen/helper-git-cipher'
import { FileStorage } from '@guanghechen/helper-storage'
import { logger } from '../../core/logger'

export interface ICreateGitCipherContextParams {
  catalogCipher: ICipher
  catalogContext: IFileCipherCatalogContext
  catalogFilepath: string
  cipherFactory: ICipherFactory
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
}

export function createContext(params: ICreateGitCipherContextParams): IGitCipherContext {
  const { catalogCipher, catalogContext, catalogFilepath, cipherFactory, getDynamicIv } = params
  const fileCipherFactory: IFileCipherFactory = new FileCipherFactory({ cipherFactory, logger })
  const fileSplitter = new FileSplitter({ partCodePrefix: catalogContext.partCodePrefix })
  const configKeeper = new GitCipherConfigKeeper({
    cipher: catalogCipher,
    storage: new FileStorage({
      strict: true,
      filepath: catalogFilepath,
      encoding: 'utf8',
    }),
  })
  const cipherBatcher = new FileCipherBatcher({
    fileCipherFactory,
    fileSplitter,
    maxTargetFileSize: catalogContext.maxTargetFileSize,
    logger,
  })
  const context = new GitCipherContext({
    catalogContext,
    cipherBatcher,
    configKeeper,
    logger,
    getDynamicIv,
  })
  return context
}
