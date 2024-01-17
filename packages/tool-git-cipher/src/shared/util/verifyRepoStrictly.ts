import { showCommitInfo } from '@guanghechen/helper-git'
import type { GitCipher } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import type { IReporter } from '@guanghechen/reporter.types'
import { FileTextResource } from '@guanghechen/resource'
import type { ICatalogCache } from '../CatalogCache'
import { CatalogCacheKeeper } from '../CatalogCache'

export interface IVerifyCryptRepoStrictlyParams {
  readonly catalogCachePath: string
  readonly cryptCommitId: string
  readonly cryptRootDir: string
  readonly gitCipher: GitCipher
  readonly plainCommitId: string | undefined
  readonly reporter: IReporter
}

export async function verifyRepoStrictly(params: IVerifyCryptRepoStrictlyParams): Promise<void> {
  const title = 'verifyRepoStrictly'
  const { catalogCachePath, cryptRootDir, gitCipher, reporter } = params

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
      resource: new FileTextResource({
        strict: true,
        filepath: catalogCachePath,
        encoding: 'utf8',
      }),
      reporter,
    })

    const catalogCache: ICatalogCache = await cacheKeeper.load()
    const crypt2plainIdMap: Map<string, string> = catalogCache.crypt2plainIdMap ?? new Map()
    plainCommitId = crypt2plainIdMap.get(cryptCommitId)
  }

  reporter.debug(`[${title}] cryptCommitId(${cryptCommitId}), plainCommitId(${plainCommitId}).`)
  invariant(!!plainCommitId, `[${title}] Missing plainCommitId.`)

  await gitCipher.verifyCommit({ cryptCommitId, plainCommitId })
}
