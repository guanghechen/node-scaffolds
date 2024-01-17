import { type IReadonlyCipherCatalog, calcCryptPathsWithPart } from '@guanghechen/cipher-catalog'
import type { IConfigKeeper } from '@guanghechen/config'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { checkBranch, getAllLocalBranches, isGitRepo, listAllFiles } from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import type { IReporter } from '@guanghechen/reporter.types'
import { existsSync } from 'node:fs'
import type { IGitCipherConfig } from '../types'

export interface IVerifyCryptGitCommitParams {
  catalog: IReadonlyCipherCatalog
  catalogConfigPath: string
  configKeeper: IConfigKeeper<IGitCipherConfig>
  cryptCommitId: string
  cryptPathResolver: IWorkspacePathResolver
  reporter: IReporter | undefined
}

export async function verifyCryptGitCommit(
  params: IVerifyCryptGitCommitParams,
): Promise<void | never> {
  const title = 'verifyCryptGitCommit'
  const { catalog, configKeeper, cryptCommitId, cryptPathResolver, reporter } = params

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
    const cipherConfig: IGitCipherConfig = await configKeeper.load()
    const allCryptFiles: string[] = await listAllFiles({ ...cryptCtx, commitHash: cryptCommitId })

    const expectedCryptPaths: string[] = await Promise.all<string[]>(
      (cipherConfig?.catalog.items ?? []).map(
        (item): Promise<string[]> =>
          catalog
            .calcCryptPath(item.plainPath)
            .then(cryptPath => calcCryptPathsWithPart(cryptPath, item.cryptPathParts)),
      ),
    ).then(paths => paths.flat())
    const expectedSet: Set<string> = new Set(expectedCryptPaths)
    const matchedSet: Set<string> = new Set()
    const unMatchedSet: Set<string> = new Set()

    const catalogConfigPath: string = cryptPathResolver.relative(params.catalogConfigPath, true)
    for (const cryptFilepath of allCryptFiles) {
      if (cryptFilepath === catalogConfigPath) continue
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
