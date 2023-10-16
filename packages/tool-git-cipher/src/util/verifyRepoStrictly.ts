import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import { showCommitInfo } from '@guanghechen/helper-git'
import type { GitCipher } from '@guanghechen/helper-git-cipher'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import { logger } from '../core/logger'
import { CatalogCacheKeeper } from './CatalogCache'

export interface IVerifyCryptRepoStrictlyParams {
  readonly catalogCacheFilepath: string
  readonly catalogCipher: ICipher | undefined
  readonly cipherFactory: ICipherFactory | undefined
  readonly cryptCommitId: string
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly gitCipher: GitCipher
  readonly plainCommitId: string | undefined
  readonly plainPathResolver: IWorkspacePathResolver
}

export async function verifyRepoStrictly(params: IVerifyCryptRepoStrictlyParams): Promise<void> {
  const title = 'verifyRepoStrictly'
  const {
    catalogCacheFilepath,
    catalogCipher,
    cipherFactory,
    cryptPathResolver,
    gitCipher,
    plainPathResolver,
  } = params

  invariant(
    !!cipherFactory && !!catalogCipher,
    `[${title}] cipherFactory or catalogCipher is not available!`,
  )

  // To avoid the `HEAD` reference.
  const cryptCommitId: string = (
    await showCommitInfo({
      commitHash: params.cryptCommitId,
      cwd: cryptPathResolver.root,
      logger,
    })
  ).commitId

  let plainCommitId = params.plainCommitId
  if (!plainCommitId) {
    const cacheKeeper = new CatalogCacheKeeper({
      storage: new FileStorage({
        strict: true,
        filepath: catalogCacheFilepath,
        encoding: 'utf8',
      }),
    })

    await cacheKeeper.load()
    const { crypt2plainIdMap } = cacheKeeper.data ?? { crypt2plainIdMap: new Map() }
    plainCommitId = crypt2plainIdMap.get(cryptCommitId)
  }

  logger.debug(`[${title}] cryptCommitId(${cryptCommitId}), plainCommitId(${plainCommitId}).`)
  invariant(!!plainCommitId, `[${title}] Missing plainCommitId.`)

  await gitCipher.verifyCommit({
    cryptCommitId,
    cryptPathResolver,
    plainCommitId,
    plainPathResolver,
  })
}
