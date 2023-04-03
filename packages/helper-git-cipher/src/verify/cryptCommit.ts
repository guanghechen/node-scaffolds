import type { IFileCipherCatalogContext } from '@guanghechen/helper-cipher-file'
import { calcCryptFilepath, calcCryptFilepaths } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { checkBranch, getAllLocalBranches, isGitRepo, listAllFiles } from '@guanghechen/helper-git'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import { existsSync } from 'node:fs'
import type { IGitCipherConfig } from '../types'

export interface IVerifyCryptGitCommitParams {
  catalogContext: IFileCipherCatalogContext
  catalogFilepath: string
  configKeeper: IConfigKeeper<IGitCipherConfig>
  cryptCommitId: string
  cryptPathResolver: FilepathResolver
  logger: ILogger | undefined
}

export async function verifyCryptGitCommit(
  params: IVerifyCryptGitCommitParams,
): Promise<void | never> {
  const title = 'verifyCryptGitCommit'
  const { catalogContext, configKeeper, cryptCommitId, cryptPathResolver, logger } = params

  invariant(
    existsSync(cryptPathResolver.rootDir),
    `[${title}] Cannot find cryptRootDir. ${cryptPathResolver.rootDir}`,
  )

  invariant(
    isGitRepo(cryptPathResolver.rootDir),
    `[${title}] cryptRootDir is not a git repo. ${cryptPathResolver.rootDir}`,
  )

  const catalogFilepath: string = cryptPathResolver.relative(params.catalogFilepath)
  const cryptCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }

  const cryptCurrentBranches = await getAllLocalBranches({ ...cryptCtx })
  invariant(!!cryptCurrentBranches.currentBranch, `[${title}] crypt repo not at any branch.`)

  try {
    await checkBranch({ ...cryptCtx, commitHash: cryptCommitId })

    await configKeeper.load()
    const expectedCryptFilepaths: string[] =
      configKeeper.data?.catalog.items
        ?.map(item => {
          const cryptFilepath: string = calcCryptFilepath(item.plainFilepath, catalogContext)
          return calcCryptFilepaths(cryptFilepath, item.cryptFilepathParts)
        })
        .flat() ?? []
    const expectedSet: Set<string> = new Set(expectedCryptFilepaths)

    const allCryptFilepaths: string[] = await listAllFiles({
      ...cryptCtx,
      commitHash: cryptCommitId,
    })

    const matchedSet: Set<string> = new Set()
    const unMatchedSet: Set<string> = new Set()

    for (const cryptFilepath of allCryptFilepaths) {
      if (cryptFilepath === catalogFilepath) continue
      if (expectedSet.has(cryptFilepath)) matchedSet.add(cryptFilepath)
      else unMatchedSet.add(cryptFilepath)
    }

    invariant(
      unMatchedSet.size === 0,
      `Some crypt filepaths are not recorded in catalog:` +
        Array.from(unMatchedSet)
          .map(f => `\n  - ${f}`)
          .join(''),
    )

    invariant(
      matchedSet.size === expectedSet.size,
      `Missing crypt filepaths in catalog:` +
        Array.from(expectedSet)
          .filter(f => !matchedSet.has(f))
          .map(f => `\n  - ${f}`)
          .join(''),
    )

    logger?.info(`Everything looks good!`)
  } finally {
    await checkBranch({ ...cryptCtx, commitHash: cryptCurrentBranches.currentBranch })
  }
}
