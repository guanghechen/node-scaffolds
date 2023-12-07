import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import type { CipherCatalogContext } from '@guanghechen/cipher-catalog'
import type { IGitCipherContext } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import type { IReporter } from '@guanghechen/reporter.types'
import type { SecretMaster } from '../../SecretMaster'
import { createContext } from './createContext'

export interface ILoadGitCipherContextParams {
  secretFilepath: string
  secretMaster: SecretMaster
  cryptPathResolver: IWorkspacePathResolver
  plainPathResolver: IWorkspacePathResolver
  reporter: IReporter
}

export async function loadGitCipherContext(
  params: ILoadGitCipherContextParams,
): Promise<IGitCipherContext> {
  const { secretFilepath, secretMaster, cryptPathResolver, plainPathResolver, reporter } = params
  const secretKeeper = await secretMaster.load({
    filepath: secretFilepath,
    cryptRootDir: cryptPathResolver.root,
    force: false,
  })

  const catalogCipher: ICipher | undefined = secretMaster.catalogCipher
  const cipherFactory: ICipherFactory | undefined = secretMaster.cipherFactory
  invariant(
    !!catalogCipher && !!cipherFactory,
    '[loadGitCipherContext] Secret master is not available!',
  )

  const catalogContext: CipherCatalogContext | undefined = secretKeeper.createCatalogContext({
    cryptPathResolver,
    plainPathResolver,
    calcIvFromBytes: secretMaster.calcIvFromBytes,
  })
  const catalogFilepath: string | undefined = secretKeeper.data?.catalogFilepath
  invariant(
    !!catalogContext && !!catalogFilepath,
    '[loadGitCipherContext] Secret cipherFactory is not available!',
  )

  const context: IGitCipherContext = createContext({
    catalogCipher,
    catalogContext,
    catalogFilepath,
    cipherFactory,
    reporter,
  })
  return context
}
