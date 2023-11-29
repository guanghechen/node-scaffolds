import type { IReadonlyCipherCatalog } from '@guanghechen/cipher-workspace.types'
import type { IConfigKeeper } from '@guanghechen/config'
import { calcCryptFilepathsWithParts } from '@guanghechen/helper-cipher-file'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { checkBranch, getAllLocalBranches, isGitRepo, listAllFiles } from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { IReporter } from '@guanghechen/reporter.types'
import { existsSync } from 'node:fs'
import type { IGitCipherConfig } from '../types'

export interface IVerifyCryptGitCommitParams {
  catalog: IReadonlyCipherCatalog
  catalogFilepath: string
  configKeeper: IConfigKeeper<IGitCipherConfig>
  cryptCommitId: string
  reporter: IReporter | undefined
}

export async function verifyCryptGitCommit(
  params: IVerifyCryptGitCommitParams,
): Promise<void | never> {
  const title = 'verifyCryptGitCommit'
  const { catalog, configKeeper, cryptCommitId, reporter } = params
  const { cryptPathResolver } = catalog.context

  invariant(
    existsSync(cryptPathResolver.root),
    `[${title}] Cannot find cryptRootDir. ${cryptPathResolver.root}`,
  )

  invariant(
    isGitRepo(cryptPathResolver.root),
    `[${title}] cryptRootDir is not a git repo. ${cryptPathResolver.root}`,
  )

  const cryptCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, reporter }

  const cryptCurrentBranches = await getAllLocalBranches(cryptCtx)
  invariant(!!cryptCurrentBranches.currentBranch, `[${title}] crypt repo does not at any branch.`)

  try {
    await checkBranch({ ...cryptCtx, commitHash: cryptCommitId })
    await configKeeper.load()
    const allCryptFiles: string[] = await listAllFiles({ ...cryptCtx, commitHash: cryptCommitId })

    const expectedCryptFilepaths: string[] = (configKeeper.data?.catalog.items ?? [])
      .map(item => {
        const cryptFilepath: string = catalog.calcCryptFilepath(item.plainFilepath)
        return calcCryptFilepathsWithParts(cryptFilepath, item.cryptFilepathParts)
      })
      .flat()
    const expectedSet: Set<string> = new Set(expectedCryptFilepaths)
    const matchedSet: Set<string> = new Set()
    const unMatchedSet: Set<string> = new Set()

    const catalogFilepath: string = cryptPathResolver.relative(params.catalogFilepath)
    for (const cryptFilepath of allCryptFiles) {
      if (cryptFilepath === catalogFilepath) continue
      if (expectedSet.has(cryptFilepath)) matchedSet.add(cryptFilepath)
      else unMatchedSet.add(cryptFilepath)
    }

    invariant(
      unMatchedSet.size === 0,
      `[${title}] Some crypt filepaths are not recorded in catalog:` +
        Array.from(unMatchedSet)
          .map(f => `\n  - ${f}`)
          .join(''),
    )
    invariant(
      matchedSet.size === expectedSet.size,
      `[${title}] Missing crypt filepaths in catalog:` +
        Array.from(expectedSet)
          .filter(f => !matchedSet.has(f))
          .map(f => `\n  - ${f}`)
          .join(''),
    )

    reporter?.info(`Everything looks good!`)
  } finally {
    await checkBranch({ ...cryptCtx, commitHash: cryptCurrentBranches.currentBranch })
  }
}
