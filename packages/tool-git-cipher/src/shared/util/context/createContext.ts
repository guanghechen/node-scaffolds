import type { ICipherFactory } from '@guanghechen/cipher'
import type { ICipherCatalog, ICipherCatalogContext } from '@guanghechen/cipher-catalog'
import { CipherCatalog } from '@guanghechen/cipher-catalog'
import { FileSplitter } from '@guanghechen/file-split'
import type { IFileCipherFactory } from '@guanghechen/helper-cipher-file'
import { FileCipherBatcher, FileCipherFactory } from '@guanghechen/helper-cipher-file'
import type { IGitCipherContext } from '@guanghechen/helper-git-cipher'
import { GitCipherConfigKeeper } from '@guanghechen/helper-git-cipher'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import type { IReporter } from '@guanghechen/reporter.types'
import { FileTextResource } from '@guanghechen/resource'

export interface ICreateGitCipherContextParams {
  readonly catalogCipherFactory: ICipherFactory
  readonly catalogContext: ICipherCatalogContext
  readonly catalogConfigPath: string
  readonly contentCipherFactory: ICipherFactory
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
  readonly reporter: IReporter
  readonly genNonceByCommitMessage: (message: string) => Uint8Array
}

export function createContext(params: ICreateGitCipherContextParams): IGitCipherContext {
  const {
    catalogCipherFactory, //
    catalogContext,
    catalogConfigPath,
    contentCipherFactory,
    cryptPathResolver,
    plainPathResolver,
    reporter,
    genNonceByCommitMessage,
  } = params
  const fileCipherFactory: IFileCipherFactory = new FileCipherFactory({
    cipherFactory: contentCipherFactory,
    reporter,
  })
  const fileSplitter = new FileSplitter({ partCodePrefix: catalogContext.PART_CODE_PREFIX })
  const catalog: ICipherCatalog = new CipherCatalog(catalogContext)
  const configKeeper = new GitCipherConfigKeeper({
    MAX_CRYPT_FILE_SIZE: catalogContext.MAX_CRYPT_FILE_SIZE,
    PART_CODE_PREFIX: catalogContext.PART_CODE_PREFIX,
    cipherFactory: catalogCipherFactory,
    resource: new FileTextResource({
      strict: true,
      filepath: catalogConfigPath,
      encoding: 'utf8',
    }),
    genNonceByCommitMessage,
  })
  const cipherBatcher = new FileCipherBatcher({
    MAX_CRYPT_FILE_SIZE: catalogContext.MAX_CRYPT_FILE_SIZE,
    PART_CODE_PREFIX: catalogContext.PART_CODE_PREFIX,
    fileCipherFactory,
    fileSplitter,
    reporter,
    genNonce: (...args) => catalogContext.genNonce(...args),
  })
  const context: IGitCipherContext = {
    catalog,
    catalogConfigPath,
    cipherBatcher,
    configKeeper,
    cryptPathResolver,
    plainPathResolver,
    reporter,
  }
  return context
}
