import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import { showCommitInfo } from '@guanghechen/helper-git'
import type { GitCipher } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import type { IReporter } from '@guanghechen/reporter.types'
import { TextFileResource } from '@guanghechen/resource'
import { CatalogCacheKeeper } from '../CatalogCache'

export interface IVerifyCryptRepoStrictlyParams {
  readonly catalogCacheFilepath: string
  readonly catalogCipher: ICipher | undefined
  readonly cipherFactory: ICipherFactory | undefined
  readonly cryptCommitId: string
  readonly cryptRootDir: string
  readonly gitCipher: GitCipher
  readonly plainCommitId: string | undefined
  readonly reporter: IReporter
}

export async function verifyRepoStrictly(params: IVerifyCryptRepoStrictlyParams): Promise<void> {
  const title = 'verifyRepoStrictly'
  const { catalogCacheFilepath, catalogCipher, cipherFactory, cryptRootDir, gitCipher, reporter } =
    params

  invariant(
    !!cipherFactory && !!catalogCipher,
    `[${title}] cipherFactory or catalogCipher is not available!`,
  )

  // To avoid the `HEAD` reference.
  const cryptCommitId: string = (
    await showCommitInfo({
      commitHash: params.cryptCommitId,
      cwd: cryptRootDir,
      reporter,
    })
  ).commitId

  let plainCommitId = params.plainCommitId
  if (!plainCommitId) {
    const cacheKeeper = new CatalogCacheKeeper({
      resource: new TextFileResource({
        strict: true,
        filepath: catalogCacheFilepath,
        encoding: 'utf8',
      }),
      reporter,
    })

    await cacheKeeper.load()
    const { crypt2plainIdMap } = cacheKeeper.data ?? { crypt2plainIdMap: new Map() }
    plainCommitId = crypt2plainIdMap.get(cryptCommitId)
  }

  reporter.debug(`[${title}] cryptCommitId(${cryptCommitId}), plainCommitId(${plainCommitId}).`)
  invariant(!!plainCommitId, `[${title}] Missing plainCommitId.`)

  await gitCipher.verifyCommit({ cryptCommitId, plainCommitId })
}
