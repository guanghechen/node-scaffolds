import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IFileCipherCatalog,
  IJsonConfigKeeper,
} from '@guanghechen/helper-cipher-file'
import { mkdirsIfNotExists } from '@guanghechen/helper-fs'
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
  multilineMessagePrefix?: string
}

export async function encryptGitRepo(params: IEncryptGitRepoParams): Promise<void> {
  const { catalog, cipherBatcher, configKeeper, pathResolver, multilineMessagePrefix, logger } =
    params
  invariant(
    !(await hasUncommittedContent({ cwd: pathResolver.plainRootDir, logger })),
    '[encryptGitRepo] plain repo has uncommitted contents.',
  )

  const plainLocalBranch = await getAllLocalBranches({ cwd: pathResolver.plainRootDir, logger })
  invariant(
    plainLocalBranch.currentBranch !== null,
    '[encryptGitRepo] plain repo is not under any branch.',
  )

  const isCryptRepoInitialized: boolean = isGitRepo(pathResolver.cryptRootDir)
  const oldCryptLocalBranch = isCryptRepoInitialized
    ? await getAllLocalBranches({
        cwd: pathResolver.cryptRootDir,
        logger,
      })
    : {
        currentBranch: plainLocalBranch.currentBranch,
        branches: [plainLocalBranch.currentBranch],
      }

  let plain2cryptIdMap: Map<string, string>

  // Initialize crypt repo.
  if (!isCryptRepoInitialized) {
    mkdirsIfNotExists(pathResolver.cryptRootDir, true)
    logger?.verbose?.('[encryptGitRepo] initialize crypt repo.')
    await initGitRepo({
      defaultBranch: plainLocalBranch.currentBranch,
      cwd: pathResolver.cryptRootDir,
      logger,
    })
    plain2cryptIdMap = new Map<string, string>()
  } else {
    invariant(
      !(await hasUncommittedContent({ cwd: pathResolver.cryptRootDir, logger })),
      '[encryptGitRepo] crypt repo has uncommitted contents.',
    )

    const cryptLocalBranch = await getAllLocalBranches({ cwd: pathResolver.cryptRootDir, logger })
    const commitIdMap = await extractPlain2CryptCommitIdMap({
      plainBranches: cryptLocalBranch.branches,
      pathResolver,
      logger,
    })
    plain2cryptIdMap = commitIdMap.plain2cryptIdMap
  }

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
      multilineMessagePrefix,
      logger,
    })

    const { commitId: cryptHeadCommitId } = await showCommitInfo({
      branchOrCommitId: 'HEAD',
      messagePrefix: multilineMessagePrefix,
      cwd: pathResolver.cryptRootDir,
      logger,
    })
    newCryptBranches.push({ branchName, commitId: cryptHeadCommitId })
  }

  // [crypt] set branches sames with the plain repo.
  {
    // Detach from current branch.
    if (oldCryptLocalBranch.currentBranch) {
      const { commitId: cryptHeadCommitId } = await showCommitInfo({
        branchOrCommitId: 'HEAD',
        messagePrefix: multilineMessagePrefix,
        cwd: pathResolver.cryptRootDir,
        logger,
      })
      await checkBranch({
        branchOrCommitId: cryptHeadCommitId,
        cwd: pathResolver.cryptRootDir,
        logger,
      })
    }

    // Delete all existed branches.
    for (const branch of oldCryptLocalBranch.branches) {
      await deleteBranch({
        branchName: branch,
        force: true,
        cwd: pathResolver.cryptRootDir,
        logger,
      })
    }

    // Create branches.
    for (const { branchName, commitId } of newCryptBranches) {
      await createBranch({
        newBranchName: branchName,
        branchOrCommitId: commitId,
        cwd: pathResolver.cryptRootDir,
        logger,
      })
    }

    // Check to the same branch with plain repo.
    await checkBranch({
      branchOrCommitId: plainLocalBranch.currentBranch,
      cwd: pathResolver.cryptRootDir,
      logger,
    })
  }

  // [plain] recover the HEAD pointer.
  await checkBranch({
    branchOrCommitId: plainLocalBranch.currentBranch,
    cwd: pathResolver.plainRootDir,
    logger,
  })
}
