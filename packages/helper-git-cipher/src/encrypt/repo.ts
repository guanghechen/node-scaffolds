import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IFileCipherCatalog,
  IJsonConfigKeeper,
} from '@guanghechen/helper-cipher-file'
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
import type { IGitCipherConfigData } from '../types'
import { extractPlain2CryptCommitIdMap } from '../util'
import { encryptGitBranch } from './branch'

export interface IEncryptGitRepoParams {
  catalog: IFileCipherCatalog
  cipherBatcher: IFileCipherBatcher
  configKeeper: IJsonConfigKeeper<IGitCipherConfigData>
  pathResolver: FileCipherPathResolver
  logger?: ILogger
}

export async function encryptGitRepo(params: IEncryptGitRepoParams): Promise<void> {
  const { catalog, cipherBatcher, configKeeper, pathResolver, logger } = params
  const plainCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.plainRootDir, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.cryptRootDir, logger }

  invariant(
    isGitRepo(pathResolver.plainRootDir),
    `[decryptGitRepo] plain repo is not a git repo. (${pathResolver.plainRootDir})`,
  )

  invariant(
    !(await hasUncommittedContent(plainCmdCtx)),
    '[encryptGitRepo] plain repo has uncommitted contents.',
  )

  const plainLocalBranch = await getAllLocalBranches(plainCmdCtx)
  invariant(
    plainLocalBranch.currentBranch !== null,
    '[encryptGitRepo] plain repo is not under any branch.',
  )

  const isCryptRepoInitialized: boolean = isGitRepo(pathResolver.cryptRootDir)
  const oldCryptLocalBranch = isCryptRepoInitialized
    ? await getAllLocalBranches(cryptCmdCtx)
    : {
        currentBranch: plainLocalBranch.currentBranch,
        branches: [plainLocalBranch.currentBranch],
      }

  let plain2cryptIdMap: Map<string, string>

  // Initialize crypt repo.
  if (!isCryptRepoInitialized) {
    mkdirsIfNotExists(pathResolver.cryptRootDir, true)
    logger?.verbose?.('[encryptGitRepo] initialize crypt repo.')
    await initGitRepo({ ...cryptCmdCtx, defaultBranch: plainLocalBranch.currentBranch })
    plain2cryptIdMap = new Map<string, string>()
  } else {
    invariant(
      !(await hasUncommittedContent(cryptCmdCtx)),
      '[encryptGitRepo] crypt repo has uncommitted contents.',
    )

    const cryptLocalBranch = await getAllLocalBranches(cryptCmdCtx)
    const commitIdMap = await extractPlain2CryptCommitIdMap({
      plainBranches: cryptLocalBranch.branches,
      pathResolver,
      logger,
    })
    plain2cryptIdMap = commitIdMap.plain2cryptIdMap
  }

  try {
    // encrypt branches.
    const newCryptBranches: Array<{ branchName: string; commitId: string }> = []
    for (const branchName of plainLocalBranch.branches) {
      await encryptGitBranch({
        branchName,
        plain2cryptIdMap,
        catalog,
        cipherBatcher,
        pathResolver,
        configKeeper,
        logger,
      })

      const { commitId: cryptHeadCommitId } = await showCommitInfo({
        ...cryptCmdCtx,
        branchOrCommitId: 'HEAD',
      })
      newCryptBranches.push({ branchName, commitId: cryptHeadCommitId })
    }

    // [crypt] set branches sames with the plain repo.
    {
      // Detach from current branch.
      if (oldCryptLocalBranch.currentBranch) {
        const { commitId: cryptHeadCommitId } = await showCommitInfo({
          ...cryptCmdCtx,
          branchOrCommitId: 'HEAD',
        })
        await checkBranch({ ...cryptCmdCtx, branchOrCommitId: cryptHeadCommitId })
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
          branchOrCommitId: commitId,
        })
      }

      // Check to the same branch with plain repo.
      await checkBranch({ ...cryptCmdCtx, branchOrCommitId: plainLocalBranch.currentBranch })
    }
  } finally {
    // [plain] recover the HEAD pointer.
    await checkBranch({ ...plainCmdCtx, branchOrCommitId: plainLocalBranch.currentBranch })
  }
}
