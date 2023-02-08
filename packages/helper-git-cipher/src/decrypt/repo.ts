import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IJsonConfigKeeper,
} from '@guanghechen/helper-cipher-file'
import { mkdirsIfNotExists } from '@guanghechen/helper-fs'
import type { IGitCommandBaseParams, IGitCommitWithMessage } from '@guanghechen/helper-git'
import {
  checkBranch,
  createBranch,
  deleteBranch,
  getAllLocalBranches,
  getCommitWithMessageList,
  hasUncommittedContent,
  initGitRepo,
  isGitRepo,
  showCommitInfo,
} from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfigData } from '../types'
import { extractCrypt2PlainCommitIdMap } from '../util'
import { decryptGitBranch } from './branch'

export interface IDecryptGitRepoParams {
  cipherBatcher: IFileCipherBatcher
  configKeeper: IJsonConfigKeeper<IGitCipherConfigData>
  pathResolver: FileCipherPathResolver
  logger?: ILogger
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
export async function decryptGitRepo(params: IDecryptGitRepoParams): Promise<void> {
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

  let plainIdSet: Set<string>

  // Initialize plain repo.
  if (!isPlainRepoInitialized) {
    mkdirsIfNotExists(pathResolver.plainRootDir, true)
    logger?.verbose?.('[decryptGitRepo] initialize plain repo.')
    await initGitRepo({ ...plainCmdCtx, defaultBranch: cryptLocalBranch.currentBranch })
    plainIdSet = new Set<string>()
  } else {
    invariant(
      !(await hasUncommittedContent(plainCmdCtx)),
      '[decryptGitRepo] plain repo has uncommitted contents.',
    )
    const commitWithMessageList: IGitCommitWithMessage[] = await getCommitWithMessageList({
      ...plainCmdCtx,
      branchOrCommitIds: oldPlainLocalBranch.branches,
    })
    plainIdSet = new Set<string>()
    for (const item of commitWithMessageList) plainIdSet.add(item.id)
  }

  try {
    // decrypt branches.
    const newPlainBranches: Array<{ branchName: string; commitId: string }> = []
    {
      const { crypt2plainIdMap } = await extractCrypt2PlainCommitIdMap({
        cryptBranches: cryptLocalBranch.branches,
        pathResolver,
        logger,
      })
      for (const branchName of cryptLocalBranch.branches) {
        await decryptGitBranch({
          branchName,
          crypt2plainIdMap,
          plainIdSet,
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
}
