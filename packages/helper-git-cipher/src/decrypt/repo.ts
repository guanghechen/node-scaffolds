import type { IFileCipherBatcher, IFileCipherCatalogContext } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import { mkdirsIfNotExists } from '@guanghechen/helper-fs'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import {
  checkBranch,
  createBranch,
  deleteBranch,
  getAllLocalBranches,
  hasUncommittedContent,
  initGitRepo,
  isGitRepo,
  showCommitInfo,
} from '@guanghechen/helper-git'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfig } from '../types'
import { resolveIdMap } from '../util'
import { decryptGitBranch } from './branch'

export interface IDecryptGitRepoParams {
  catalogContext: IFileCipherCatalogContext
  cipherBatcher: IFileCipherBatcher
  configKeeper: IConfigKeeper<IGitCipherConfig>
  cryptPathResolver: FilepathResolver
  crypt2plainIdMap: ReadonlyMap<string, string>
  gpgSign?: boolean
  logger: ILogger | undefined
  plainPathResolver: FilepathResolver
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
}

export interface IDecryptGitRepoResult {
  crypt2plainIdMap: Map<string, string>
}

/**
 * Decrypt git repo (all branches with names).
 *
 * !!! Required (this method is not recommend to use directly)
 *  - Both the plain repo (could be empty) and crypt repo should be clean (no untracked files).
 *  - The crypt repo should under one of named branch.
 *
 * @param params
 */
export async function decryptGitRepo(
  params: IDecryptGitRepoParams,
): Promise<IDecryptGitRepoResult> {
  const {
    catalogContext,
    cipherBatcher,
    configKeeper,
    cryptPathResolver,
    logger,
    plainPathResolver,
    getDynamicIv,
  } = params
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.rootDir, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }

  invariant(
    isGitRepo(cryptPathResolver.rootDir),
    `[decryptGitRepo] crypt repo is not a git repo. (${cryptPathResolver.rootDir})`,
  )

  invariant(
    !(await hasUncommittedContent(cryptCmdCtx)),
    '[decryptGitRepo] crypt repo has uncommitted contents.',
  )

  const cryptLocalBranch = await getAllLocalBranches(cryptCmdCtx)
  invariant(
    cryptLocalBranch.currentBranch !== null,
    '[decryptGitRepo] crypt repo is not under any branch.',
  )

  const isPlainRepoInitialized: boolean = isGitRepo(plainPathResolver.rootDir)
  const oldPlainLocalBranch = isPlainRepoInitialized
    ? await getAllLocalBranches(plainCmdCtx)
    : {
        currentBranch: cryptLocalBranch.currentBranch,
        branches: [cryptLocalBranch.currentBranch],
      }

  const { crypt2plainIdMap } = await resolveIdMap({
    plainRootDir: plainPathResolver.rootDir,
    cryptRootDir: cryptPathResolver.rootDir,
    crypt2plainIdMap: params.crypt2plainIdMap,
    logger,
  })

  // Initialize plain repo.
  if (!isPlainRepoInitialized) {
    mkdirsIfNotExists(plainPathResolver.rootDir, true)
    logger?.verbose?.('[decryptGitRepo] initialize plain repo.')
    await initGitRepo({
      ...plainCmdCtx,
      defaultBranch: cryptLocalBranch.currentBranch,
      gpgSign: params.gpgSign,
    })
  } else {
    invariant(
      !(await hasUncommittedContent(plainCmdCtx)),
      '[decryptGitRepo] plain repo has uncommitted contents.',
    )

    invariant(
      crypt2plainIdMap.size > 0,
      '[decryptGitRepo] bad plain repo, no paired plain/crypt commit found.',
    )
  }

  try {
    // decrypt branches.
    const newPlainBranches: Array<{ branchName: string; commitId: string }> = []
    {
      for (const branchName of cryptLocalBranch.branches) {
        await decryptGitBranch({
          branchName,
          catalogContext,
          cipherBatcher,
          configKeeper,
          cryptPathResolver,
          crypt2plainIdMap,
          logger,
          plainPathResolver,
          getDynamicIv,
        })

        const { commitId: plainHeadCommitId } = await showCommitInfo({
          ...plainCmdCtx,
          commitHash: 'HEAD',
        })
        newPlainBranches.push({ branchName, commitId: plainHeadCommitId })
      }
    }

    // [plain] set branches same with the crypt repo.
    {
      // Detach from current branch.
      if (oldPlainLocalBranch.currentBranch) {
        const { commitId: plainHeadCommitId } = await showCommitInfo({
          ...plainCmdCtx,
          commitHash: 'HEAD',
        })
        await checkBranch({ ...plainCmdCtx, commitHash: plainHeadCommitId })
      }

      // Delete all branches.
      for (const branchName of oldPlainLocalBranch.branches) {
        await deleteBranch({ ...plainCmdCtx, branchName, force: true })
      }

      // Create branches.
      for (const { branchName, commitId } of newPlainBranches) {
        await createBranch({
          ...plainCmdCtx,
          newBranchName: branchName,
          commitHash: commitId,
        })
      }

      // Check to the same branch with the crypt repo.
      await checkBranch({ ...plainCmdCtx, commitHash: cryptLocalBranch.currentBranch })
    }
  } finally {
    // [crypt] recover the HEAD pointer.
    await checkBranch({ ...cryptCmdCtx, commitHash: cryptLocalBranch.currentBranch })
  }

  return { crypt2plainIdMap }
}
