import type { FileCipherPathResolver, IFileCipherBatcher } from '@guanghechen/helper-cipher-file'
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
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfig } from '../types'
import { resolveIdMap } from '../util'
import { decryptGitBranch } from './branch'

export interface IDecryptGitRepoParams {
  cipherBatcher: IFileCipherBatcher
  configKeeper: IConfigKeeper<IGitCipherConfig>
  pathResolver: FileCipherPathResolver
  crypt2plainIdMap: ReadonlyMap<string, string>
  gpgSign?: boolean
  logger?: ILogger
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
  const { cipherBatcher, configKeeper, pathResolver, logger } = params
  const plainCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.plainRootDir, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.cryptRootDir, logger }

  invariant(
    isGitRepo(pathResolver.cryptRootDir),
    `[decryptGitRepo] crypt repo is not a git repo. (${pathResolver.cryptRootDir})`,
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

  const isPlainRepoInitialized: boolean = isGitRepo(pathResolver.plainRootDir)
  const oldPlainLocalBranch = isPlainRepoInitialized
    ? await getAllLocalBranches(plainCmdCtx)
    : {
        currentBranch: cryptLocalBranch.currentBranch,
        branches: [cryptLocalBranch.currentBranch],
      }

  const { crypt2plainIdMap } = await resolveIdMap({
    pathResolver,
    crypt2plainIdMap: params.crypt2plainIdMap,
    logger,
  })

  // Initialize plain repo.
  if (!isPlainRepoInitialized) {
    mkdirsIfNotExists(pathResolver.plainRootDir, true)
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
          crypt2plainIdMap,
          pathResolver,
          cipherBatcher,
          configKeeper,
          logger,
        })

        const { commitId: plainHeadCommitId } = await showCommitInfo({
          ...plainCmdCtx,
          branchOrCommitId: 'HEAD',
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
          branchOrCommitId: 'HEAD',
        })
        await checkBranch({ ...plainCmdCtx, branchOrCommitId: plainHeadCommitId })
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
          branchOrCommitId: commitId,
        })
      }

      // Check to the same branch with the crypt repo.
      await checkBranch({ ...plainCmdCtx, branchOrCommitId: cryptLocalBranch.currentBranch })
    }
  } finally {
    // [crypt] recover the HEAD pointer.
    await checkBranch({ ...cryptCmdCtx, branchOrCommitId: cryptLocalBranch.currentBranch })
  }

  return { crypt2plainIdMap }
}
