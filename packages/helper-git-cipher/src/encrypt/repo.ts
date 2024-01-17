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
import type { IGitCipherContext } from '../types'
import { resolveIdMap } from '../util'
import { encryptGitBranch } from './branch'

export interface IEncryptGitRepoParams {
  context: IGitCipherContext
  crypt2plainIdMap: ReadonlyMap<string, string>
}

export interface IEncryptGitRepoResult {
  crypt2plainIdMap: Map<string, string>
}

export async function encryptGitRepo(
  params: IEncryptGitRepoParams,
): Promise<IEncryptGitRepoResult> {
  const title = 'encryptGitRepo'
  const { context } = params
  const { cryptPathResolver, plainPathResolver, reporter } = context

  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.root, reporter }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, reporter }

  invariant(
    isGitRepo(plainPathResolver.root),
    `[${title}] plain repo is not a git repo. (${plainPathResolver.root})`,
  )

  invariant(
    !(await hasUncommittedContent(plainCmdCtx)),
    `[${title}] plain repo has uncommitted changes.`,
  )

  const plainLocalBranch = await getAllLocalBranches(plainCmdCtx)
  invariant(
    plainLocalBranch.currentBranch !== null,
    `[${title}] plain repo is not under any branch.`,
  )

  const isCryptRepoInitialized: boolean = isGitRepo(cryptPathResolver.root)
  const oldCryptLocalBranch = isCryptRepoInitialized
    ? await getAllLocalBranches(cryptCmdCtx)
    : {
        currentBranch: plainLocalBranch.currentBranch,
        branches: [plainLocalBranch.currentBranch],
      }

  const { crypt2plainIdMap } = await resolveIdMap({
    cryptRootDir: cryptPathResolver.root,
    plainRootDir: plainPathResolver.root,
    crypt2plainIdMap: params.crypt2plainIdMap,
    reporter,
  })

  // Initialize crypt repo.
  if (!isCryptRepoInitialized) {
    mkdirsIfNotExists(cryptPathResolver.root, true)
    reporter?.verbose?.(`[${title}] initialize crypt repo.`)
    await initGitRepo({
      ...cryptCmdCtx,
      defaultBranch: plainLocalBranch.currentBranch,
      gpgSign: false,
    })
  } else {
    invariant(
      !(await hasUncommittedContent(cryptCmdCtx)),
      `[${title}] crypt repo has uncommitted contents.`,
    )

    invariant(
      crypt2plainIdMap.size > 0,
      `[${title}] bad crypt repo, no paired plain/crypt commit found.`,
    )
  }

  try {
    // encrypt branches.
    const newCryptBranches: Array<{ branchName: string; commitId: string }> = []
    const plain2cryptIdMap: Map<string, string> = new Map()
    for (const [key, value] of crypt2plainIdMap.entries()) plain2cryptIdMap.set(value, key)

    for (const branchName of plainLocalBranch.branches) {
      await encryptGitBranch({ branchName, context, plain2cryptIdMap })
      const { commitId: cryptHeadCommitId } = await showCommitInfo({
        ...cryptCmdCtx,
        commitHash: 'HEAD',
      })
      newCryptBranches.push({ branchName, commitId: cryptHeadCommitId })
    }

    crypt2plainIdMap.clear()
    for (const [key, value] of plain2cryptIdMap.entries()) crypt2plainIdMap.set(value, key)

    // [crypt] set branches sames with the plain repo.
    {
      // Detach from current branch.
      if (oldCryptLocalBranch.currentBranch) {
        const { commitId: cryptHeadCommitId } = await showCommitInfo({
          ...cryptCmdCtx,
          commitHash: 'HEAD',
        })
        await checkBranch({ ...cryptCmdCtx, commitHash: cryptHeadCommitId })
      }

      // Delete all existed branches.
      for (const branch of oldCryptLocalBranch.branches) {
        await deleteBranch({
          ...cryptCmdCtx,
          branchName: branch,
          force: true,
        })
      }

      // Create branches.
      for (const { branchName, commitId } of newCryptBranches) {
        await createBranch({
          ...cryptCmdCtx,
          newBranchName: branchName,
          commitHash: commitId,
        })
      }

      // Check to the same branch with plain repo.
      await checkBranch({ ...cryptCmdCtx, commitHash: plainLocalBranch.currentBranch })
    }
  } finally {
    // [plain] recover the HEAD pointer.
    await checkBranch({ ...plainCmdCtx, commitHash: plainLocalBranch.currentBranch })
  }

  return { crypt2plainIdMap }
}
