import type { ICipher, ICipherFactory } from '@guanghechen/helper-cipher'
import type { IFileCipherCatalogContext, IFileCipherFactory } from '@guanghechen/helper-cipher-file'
import { FileCipherBatcher, FileCipherFactory } from '@guanghechen/helper-cipher-file'
import { BigFileHelper } from '@guanghechen/helper-file'
import type { IGitCipherContext } from '@guanghechen/helper-git-cipher'
import { GitCipherConfigKeeper, GitCipherContext } from '@guanghechen/helper-git-cipher'
import { FileStorage } from '@guanghechen/helper-storage'
import { logger } from '../../env/logger'

export interface ICreateGitCipherContextParams {
  catalogCipher: ICipher
  catalogContext: IFileCipherCatalogContext
  catalogFilepath: string
  cipherFactory: ICipherFactory
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
}

export function createGitCipherContext(params: ICreateGitCipherContextParams): IGitCipherContext {
  const { catalogCipher, catalogContext, catalogFilepath, cipherFactory, getDynamicIv } = params
  const fileCipherFactory: IFileCipherFactory = new FileCipherFactory({ cipherFactory, logger })
  const fileHelper = new BigFileHelper({ partCodePrefix: catalogContext.partCodePrefix })
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
    fileHelper,
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
