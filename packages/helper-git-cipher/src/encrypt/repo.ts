import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IFileCipherCatalog,
} from '@guanghechen/helper-cipher-file'
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
import type { IGitCipherConfigData } from '../types'
import { resolveIdMap } from '../util'
import { encryptGitBranch } from './branch'

export interface IEncryptGitRepoParams {
  catalog: IFileCipherCatalog
  cipherBatcher: IFileCipherBatcher
  pathResolver: FileCipherPathResolver
  configKeeper: IConfigKeeper<IGitCipherConfigData>
  crypt2plainIdMap: ReadonlyMap<string, string>
  logger?: ILogger
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
}

export interface IEncryptGitRepoResult {
  crypt2plainIdMap: Map<string, string>
}

export async function encryptGitRepo(
  params: IEncryptGitRepoParams,
): Promise<IEncryptGitRepoResult> {
  const { catalog, cipherBatcher, pathResolver, configKeeper, logger, getDynamicIv } = params
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

  const { crypt2plainIdMap } = await resolveIdMap({
    pathResolver,
    crypt2plainIdMap: params.crypt2plainIdMap,
    logger,
  })

  // Initialize crypt repo.
  if (!isCryptRepoInitialized) {
    mkdirsIfNotExists(pathResolver.cryptRootDir, true)
    logger?.verbose?.('[encryptGitRepo] initialize crypt repo.')
    await initGitRepo({
      ...cryptCmdCtx,
      defaultBranch: plainLocalBranch.currentBranch,
      gpgSign: false,
    })
  } else {
    invariant(
      !(await hasUncommittedContent(cryptCmdCtx)),
      '[encryptGitRepo] crypt repo has uncommitted contents.',
    )

    invariant(
      crypt2plainIdMap.size > 0,
      '[encryptGitRepo] bad crypt repo, no paired plain/crypt commit found.',
    )
  }

  try {
    // encrypt branches.
    const newCryptBranches: Array<{ branchName: string; commitId: string }> = []
    const plain2cryptIdMap: Map<string, string> = new Map()
    for (const [key, value] of crypt2plainIdMap.entries()) plain2cryptIdMap.set(value, key)

    for (const branchName of plainLocalBranch.branches) {
      await encryptGitBranch({
        branchName,
        plain2cryptIdMap,
        catalog,
        cipherBatcher,
        pathResolver,
        configKeeper,
        logger,
        getDynamicIv,
      })

      const { commitId: cryptHeadCommitId } = await showCommitInfo({
        ...cryptCmdCtx,
        branchOrCommitId: 'HEAD',
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

  return { crypt2plainIdMap }
}
