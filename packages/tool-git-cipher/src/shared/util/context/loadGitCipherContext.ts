import type { ICipherFactory } from '@guanghechen/cipher'
import type { ICipherCatalogContext } from '@guanghechen/cipher-catalog'
import type { IGitCipherContext } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import type { IReporter } from '@guanghechen/reporter.types'
import type { SecretConfigKeeper } from '../../SecretConfig'
import type { ISecretConfig } from '../../SecretConfig.types'
import type { SecretMaster } from '../../SecretMaster'
import { createContext } from './createContext'

export interface ILoadGitCipherContextParams {
  readonly secretConfigPath: string
  readonly secretMaster: SecretMaster
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
  readonly reporter: IReporter
}

export async function loadGitCipherContext(
  params: ILoadGitCipherContextParams,
): Promise<IGitCipherContext> {
  const { secretConfigPath, secretMaster, cryptPathResolver, plainPathResolver, reporter } = params
  const secretKeeper: SecretConfigKeeper = await secretMaster.load({
    filepath: secretConfigPath,
    cryptRootDir: cryptPathResolver.root,
    force: false,
  })
  const secretConfig: ISecretConfig | undefined = secretKeeper.data
  invariant(!!secretConfig, '[loadGitCipherContext] Failed to load secret config.')

  const catalogCipherFactory: ICipherFactory | undefined = secretMaster.catalogCipherFactory
  const contentCipherFactory: ICipherFactory | undefined = secretMaster.contentCipherFactory
  const genNonceByCommitMessage = secretMaster.genNonceByCommitMessage
  invariant(
    !!catalogCipherFactory && !!contentCipherFactory && !!genNonceByCommitMessage,
    '[loadGitCipherContext] Secret master is not available!',
  )

  const catalogContext: ICipherCatalogContext | undefined = secretKeeper.createCatalogContext({
    NONCE_SIZE: secretConfig.mainIvSize,
    cryptPathResolver,
    plainPathResolver,
  })
  const catalogConfigPath: string | undefined = secretConfig.catalogConfigPath
  invariant(
    !!catalogContext && !!catalogConfigPath,
    '[loadGitCipherContext] Secret cipherFactory is not available!',
  )

  const context: IGitCipherContext = createContext({
    catalogCipherFactory,
    catalogContext,
    catalogConfigPath: catalogConfigPath,
    contentCipherFactory,
    cryptPathResolver,
    plainPathResolver,
    reporter,
    genNonceByCommitMessage,
  })
  return context
}
