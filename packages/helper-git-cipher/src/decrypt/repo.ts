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
import type { IGitCipherContext } from '../GitCipherContext'
import { resolveIdMap } from '../util'
import { decryptGitBranch } from './branch'

export interface IDecryptGitRepoParams {
  context: IGitCipherContext
  cryptPathResolver: FilepathResolver
  crypt2plainIdMap: ReadonlyMap<string, string>
  gpgSign?: boolean
  plainPathResolver: FilepathResolver
}

export interface IDecryptGitRepoResult {
  crypt2plainIdMap: Map<string, string>
}

/**
 * Decrypt git repo (all branches with names).
 *
 * !!!Requirement (this method is not recommend to use directly)
 *  - Both the plain repo (could be empty) and crypt repo should be clean (no untracked files).
 *  - The crypt repo should under one of named branch.
 *
 * @param params
 */
export async function decryptGitRepo(
  params: IDecryptGitRepoParams,
): Promise<IDecryptGitRepoResult> {
  const title = 'decryptGitRepo'
  const { context, cryptPathResolver, plainPathResolver } = params
  const { logger } = context
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.rootDir, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }

  invariant(
    isGitRepo(cryptPathResolver.rootDir),
    `[${title}] crypt repo is not a git repo. (${cryptPathResolver.rootDir})`,
  )

  invariant(
    !(await hasUncommittedContent(cryptCmdCtx)),
    `[${title}] crypt repo has uncommitted contents.`,
  )

  const cryptLocalBranch = await getAllLocalBranches(cryptCmdCtx)
  invariant(
    cryptLocalBranch.currentBranch !== null,
    `[${title}] crypt repo is not under any branch.`,
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
    logger?.verbose?.(`[${title}] initialize plain repo.`)
    await initGitRepo({
      ...plainCmdCtx,
      defaultBranch: cryptLocalBranch.currentBranch,
      gpgSign: params.gpgSign,
    })
  } else {
    invariant(
      !(await hasUncommittedContent(plainCmdCtx)),
      `[${title}] plain repo has uncommitted contents.`,
    )

    invariant(
      crypt2plainIdMap.size > 0,
      `[${title}] bad plain repo, no paired plain/crypt commit found.`,
    )
  }

  try {
    // decrypt branches.
    const newPlainBranches: Array<{ branchName: string; commitId: string }> = []
    {
      for (const branchName of cryptLocalBranch.branches) {
        await decryptGitBranch({
          branchName,
          context,
          crypt2plainIdMap,
          cryptPathResolver,
          plainPathResolver,
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
        await createBranch({ ...plainCmdCtx, newBranchName: branchName, commitHash: commitId })
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
