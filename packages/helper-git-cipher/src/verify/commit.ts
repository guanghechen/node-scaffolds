import type { IDeserializedCatalogItem, IReadonlyCipherCatalog } from '@guanghechen/cipher-catalog'
import type { IConfigKeeper } from '@guanghechen/config'
import { iterable2map } from '@guanghechen/helper-func'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { checkBranch, getAllLocalBranches, isGitRepo, listAllFiles } from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import type { IReporter } from '@guanghechen/reporter.types'
import { existsSync } from 'node:fs'
import type { IGitCipherConfig } from '../types'

export interface IVerifyGitCommitParams {
  catalog: IReadonlyCipherCatalog
  configKeeper: IConfigKeeper<IGitCipherConfig>
  cryptCommitId: string
  cryptPathResolver: IWorkspacePathResolver
  plainCommitId: string
  plainPathResolver: IWorkspacePathResolver
  reporter: IReporter | undefined
}

export async function verifyGitCommit(params: IVerifyGitCommitParams): Promise<void | never> {
  const title = 'verifyGitCommit'
  const {
    catalog,
    configKeeper,
    cryptCommitId,
    cryptPathResolver,
    plainCommitId,
    plainPathResolver,
    reporter,
  } = params

  invariant(
    existsSync(cryptPathResolver.root),
    `[${title}] Cannot find cryptRootDir. ${cryptPathResolver.root}`,
  )

  invariant(
    isGitRepo(cryptPathResolver.root),
    `[${title}] cryptRootDir is not a git repo. ${cryptPathResolver.root}`,
  )

  invariant(
    existsSync(plainPathResolver.root),
    `[${title}] Cannot find plainRootDir. ${plainPathResolver.root}`,
  )

  invariant(
    isGitRepo(plainPathResolver.root),
    `[${title}] plainRootDir is not a git repo. ${plainPathResolver.root}`,
  )

  const cryptCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, reporter }
  const plainCtx: IGitCommandBaseParams = { cwd: plainPathResolver.root, reporter }

  const cryptCurrentBranches = await getAllLocalBranches(cryptCtx)
  invariant(!!cryptCurrentBranches.currentBranch, `[${title}] crypt repo does not at any branch.`)

  const plainCurrentBranches = await getAllLocalBranches(plainCtx)
  invariant(!!plainCurrentBranches.currentBranch, `[${title}] plain repo does not at any branch.`)

  try {
    await checkBranch({ ...cryptCtx, commitHash: cryptCommitId })
    await checkBranch({ ...plainCtx, commitHash: plainCommitId })
    const cipherConfig: IGitCipherConfig = await configKeeper.load()
    const allPlainFiles: string[] = await listAllFiles({ ...plainCtx, commitHash: plainCommitId })

    const catalogItemMap: Map<string, IDeserializedCatalogItem> = iterable2map(
      cipherConfig?.catalog.items ?? [],
      item => item.plainPath,
    )
    invariant(
      catalogItemMap.size === allPlainFiles.length,
      `[${title}] File count not matched. expect(${allPlainFiles.length}), received(${catalogItemMap.size})`,
    )

    for (const plainPath of allPlainFiles) {
      const item: IDeserializedCatalogItem | undefined = catalogItemMap.get(plainPath)
      invariant(item !== undefined, `[${title}] Missing file. plainFilepath(${plainPath})`)

      const expectedItem = await catalog.calcCatalogItem(plainPath)
      /* c8 ignore start */
      if (item.fingerprint !== expectedItem.fingerprint) {
        reporter?.error(`[${title}] Bad file content, fingerprint are not matched.`, {
          plainPath,
          plainCommitId,
          cryptCommitId,
          expected: expectedItem.fingerprint,
          received: item.fingerprint,
        })
        throw new Error(
          `[${title}] Bad file content, fingerprint are not matched. plainFilepath(${plainPath})`,
        )
      }
      /* c8 ignore stop */
    }
    reporter?.info(`Everything looks good!`)
  } finally {
    await checkBranch({ ...cryptCtx, commitHash: cryptCurrentBranches.currentBranch })
    await checkBranch({ ...plainCtx, commitHash: plainCurrentBranches.currentBranch })
  }
}
