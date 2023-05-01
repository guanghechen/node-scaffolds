import type { IFileCipherCatalogContext } from '@guanghechen/helper-cipher-file'
import { calcCatalogItem, normalizePlainFilepath } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import { iterable2map } from '@guanghechen/helper-func'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { checkBranch, getAllLocalBranches, isGitRepo, listAllFiles } from '@guanghechen/helper-git'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import { existsSync } from 'node:fs'
import type { IFileCipherCatalogItemInstance, IGitCipherConfig } from '../types'

export interface IVerifyGitCommitParams {
  catalogContext: IFileCipherCatalogContext
  configKeeper: IConfigKeeper<IGitCipherConfig>
  cryptCommitId: string
  cryptPathResolver: FilepathResolver
  logger: ILogger | undefined
  plainCommitId: string
  plainPathResolver: FilepathResolver
}

export async function verifyGitCommit(params: IVerifyGitCommitParams): Promise<void | never> {
  const title = 'verifyGitCommit'
  const {
    catalogContext,
    configKeeper,
    cryptCommitId,
    cryptPathResolver,
    logger,
    plainCommitId,
    plainPathResolver,
  } = params

  invariant(
    existsSync(cryptPathResolver.rootDir),
    `[${title}] Cannot find cryptRootDir. ${cryptPathResolver.rootDir}`,
  )

  invariant(
    isGitRepo(cryptPathResolver.rootDir),
    `[${title}] cryptRootDir is not a git repo. ${cryptPathResolver.rootDir}`,
  )

  invariant(
    existsSync(plainPathResolver.rootDir),
    `[${title}] Cannot find plainRootDir. ${plainPathResolver.rootDir}`,
  )

  invariant(
    isGitRepo(plainPathResolver.rootDir),
    `[${title}] plainRootDir is not a git repo. ${plainPathResolver.rootDir}`,
  )

  const cryptCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }
  const plainCtx: IGitCommandBaseParams = { cwd: plainPathResolver.rootDir, logger }

  const cryptCurrentBranches = await getAllLocalBranches(cryptCtx)
  invariant(!!cryptCurrentBranches.currentBranch, `[${title}] crypt repo does not at any branch.`)

  const plainCurrentBranches = await getAllLocalBranches(plainCtx)
  invariant(!!plainCurrentBranches.currentBranch, `[${title}] plain repo does not at any branch.`)

  try {
    await checkBranch({ ...cryptCtx, commitHash: cryptCommitId })
    await checkBranch({ ...plainCtx, commitHash: plainCommitId })
    await configKeeper.load()
    const allPlainFiles: string[] = await listAllFiles({ ...plainCtx, commitHash: plainCommitId })

    const catalogItemMap: Map<string, IFileCipherCatalogItemInstance> = iterable2map(
      configKeeper.data?.catalog.items ?? [],
      item => normalizePlainFilepath(item.plainFilepath, plainPathResolver),
    )
    invariant(
      catalogItemMap.size === allPlainFiles.length,
      `[${title}] File count not matched. expect(${allPlainFiles.length}), received(${catalogItemMap.size})`,
    )

    for (const plainFilepath of allPlainFiles) {
      const key: string = normalizePlainFilepath(plainFilepath, plainPathResolver)
      const item: IFileCipherCatalogItemInstance | undefined = catalogItemMap.get(key)
      invariant(item !== undefined, `[${title}] Missing file. plainFilepath(${plainFilepath})`)

      const expectedItem = await calcCatalogItem({
        context: catalogContext,
        plainFilepath,
        plainPathResolver,
      })
      /* c8 ignore start */
      if (item.fingerprint !== expectedItem.fingerprint) {
        logger?.error(`[${title}] Bad file content, fingerprint are not matched.`, {
          plainFilepath,
          plainCommitId,
          cryptCommitId,
          expected: expectedItem.fingerprint,
          received: item.fingerprint,
        })
        throw new Error(
          `[${title}] Bad file content, fingerprint are not matched. plainFilepath(${plainFilepath})`,
        )
      }
      /* c8 ignore end */
    }
    logger?.info(`Everything looks good!`)
  } finally {
    await checkBranch({ ...cryptCtx, commitHash: cryptCurrentBranches.currentBranch })
    await checkBranch({ ...plainCtx, commitHash: plainCurrentBranches.currentBranch })
  }
}
