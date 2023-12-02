import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import type { ICipherCatalog, ICipherCatalogContext } from '@guanghechen/cipher-workspace.types'
import { FileSplitter } from '@guanghechen/file-split'
import type { IFileCipherFactory } from '@guanghechen/helper-cipher-file'
import {
  FileCipherBatcher,
  FileCipherCatalog,
  FileCipherFactory,
} from '@guanghechen/helper-cipher-file'
import type { IGitCipherContext } from '@guanghechen/helper-git-cipher'
import { GitCipherConfigKeeper } from '@guanghechen/helper-git-cipher'
import type { IReporter } from '@guanghechen/reporter.types'
import { TextFileResource } from '@guanghechen/resource'

export interface ICreateGitCipherContextParams {
  readonly catalogCipher: ICipher
  readonly catalogContext: ICipherCatalogContext
  readonly catalogFilepath: string
  readonly cipherFactory: ICipherFactory
  readonly reporter: IReporter
}

export function createContext(params: ICreateGitCipherContextParams): IGitCipherContext {
  const {
    catalogCipher, //
    catalogContext,
    catalogFilepath,
    cipherFactory,
    reporter,
  } = params
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
  const catalog: ICipherCatalog = new FileCipherCatalog(catalogContext)
  const context: IGitCipherContext = {
    catalog,
    cipherBatcher,
    configKeeper,
    reporter,
  }
  return context
}
