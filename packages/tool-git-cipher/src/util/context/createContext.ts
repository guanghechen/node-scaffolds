import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import type { ICipherCatalogContext } from '@guanghechen/cipher-workspace.types'
import { FileSplitter } from '@guanghechen/file-split'
import type { IFileCipherFactory } from '@guanghechen/helper-cipher-file'
import { FileCipherBatcher, FileCipherFactory } from '@guanghechen/helper-cipher-file'
import type { IGitCipherContext } from '@guanghechen/helper-git-cipher'
import { GitCipherConfigKeeper, GitCipherContext } from '@guanghechen/helper-git-cipher'
import { TextFileResource } from '@guanghechen/resource'
import { reporter } from '../../core/reporter'

export interface ICreateGitCipherContextParams {
  catalogCipher: ICipher
  catalogContext: ICipherCatalogContext
  catalogFilepath: string
  cipherFactory: ICipherFactory
  getDynamicIv(infos: ReadonlyArray<Uint8Array>): Readonly<Uint8Array>
}

export function createContext(params: ICreateGitCipherContextParams): IGitCipherContext {
  const { catalogCipher, catalogContext, catalogFilepath, cipherFactory, getDynamicIv } = params
  const fileCipherFactory: IFileCipherFactory = new FileCipherFactory({ cipherFactory, reporter })
  const fileSplitter = new FileSplitter({ partCodePrefix: catalogContext.partCodePrefix })
  const configKeeper = new GitCipherConfigKeeper({
    cipher: catalogCipher,
    resource: new TextFileResource({
      strict: true,
      filepath: catalogFilepath,
      encoding: 'utf8',
    }),
  })
  const cipherBatcher = new FileCipherBatcher({
    fileCipherFactory,
    fileSplitter,
    maxTargetFileSize: catalogContext.maxTargetFileSize,
    reporter,
  })
  const context = new GitCipherContext({
    catalogContext,
    cipherBatcher,
    configKeeper,
    reporter,
    getDynamicIv,
  })
  return context
}
