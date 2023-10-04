import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import type { FileCipherCatalogContext } from '@guanghechen/helper-cipher-file'
import type { IGitCipherContext } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import type { SecretMaster } from '../SecretMaster'
import { createContext } from './createContext'

export interface ILoadGitCipherContextParams {
  cryptRootDir: string
  secretFilepath: string
  secretMaster: SecretMaster
}

export async function loadGitCipherContext(
  params: ILoadGitCipherContextParams,
): Promise<{ cipherFactory: ICipherFactory; context: IGitCipherContext }> {
  const { cryptRootDir, secretFilepath, secretMaster } = params
  const secretKeeper = await secretMaster.load({
    filepath: secretFilepath,
    cryptRootDir,
    force: false,
  })

  const catalogCipher: ICipher | undefined = secretMaster.catalogCipher
  const cipherFactory: ICipherFactory | undefined = secretMaster.cipherFactory
  invariant(
    !!catalogCipher && !!cipherFactory,
    '[loadGitCipherContext] Secret master is not available!',
  )

  const catalogContext: FileCipherCatalogContext | undefined = secretKeeper.createCatalogContext()
  const catalogFilepath: string | undefined = secretKeeper.data?.catalogFilepath
  invariant(
    !!catalogContext && !!catalogFilepath,
    '[loadGitCipherContext] Secret cipherFactory is not available!',
  )

  const context = createContext({
    catalogCipher,
    catalogContext,
    catalogFilepath,
    cipherFactory,
    getDynamicIv: secretMaster.getDynamicIv,
  })
  return { cipherFactory, context }
}
