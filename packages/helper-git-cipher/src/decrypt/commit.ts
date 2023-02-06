import { collectAffectedPlainFilepaths } from '@guanghechen/helper-cipher-file'
import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IJsonConfigKeeper,
} from '@guanghechen/helper-cipher-file'
import { rm } from '@guanghechen/helper-fs'
import type { IGitCommitDagNode } from '@guanghechen/helper-git'
import {
  checkBranch,
  cleanUntrackedFilepaths,
  commitAll,
  mergeCommits,
} from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfigData } from '../types'

export interface IDecryptGitCommitParams {
  cryptCommitNode: IGitCommitDagNode
  cipherBatcher: IFileCipherBatcher
  pathResolver: FileCipherPathResolver
  configKeeper: IJsonConfigKeeper<IGitCipherConfigData>
  logger?: ILogger
}

/**
 * Decrypt git commit.
 *
 * !!! Required (this method is not recommend to use directly)
 *  - Both the plain repo (could be empty) and crypt repo should be clean (no untracked files).
 *
 * @param params
 */
export async function decryptGitCommit(params: IDecryptGitCommitParams): Promise<void> {
  const { cryptCommitNode, pathResolver, cipherBatcher, configKeeper, logger } = params

  // [crypt] Move the HEAD pointer to the current decrypting commit.
  await checkBranch({
    branchOrCommitId: cryptCommitNode.id,
    cwd: pathResolver.cryptRootDir,
    logger,
  })

  // Load the diffItems between the <first parent>...<current>.
  const configData = await configKeeper.load()
  invariant(
    configData !== null,
    `[decryptGitCommit] cannot load config. filepath(${configKeeper.filepath}), cryptCommitId(${cryptCommitNode.id})`,
  )
  const { commit: plainCommit } = configData

  // [plain] Move the HEAD pointer to the first parent commit for creating commit or merging.
  if (plainCommit.parents.length > 0) {
    await checkBranch({
      branchOrCommitId: plainCommit.parents[0],
      cwd: pathResolver.plainRootDir,
      logger,
    })
  }

  let shouldAmend = false
  if (plainCommit.parents.length > 1) {
    await mergeCommits({
      ...plainCommit.signature,
      parentIds: plainCommit.parents,
      strategy: 'ours',
      cwd: pathResolver.plainRootDir,
      logger,
    })
    shouldAmend = true
  }

  // [pain] Clean untracked filepaths to avoid unexpected errors.
  const affectedPlainFiles: string[] = collectAffectedPlainFilepaths(plainCommit.catalog.diffItems)
  await cleanUntrackedFilepaths({
    filepaths: affectedPlainFiles,
    cwd: pathResolver.plainRootDir,
    logger,
  })

  // Decrypt files.
  await cipherBatcher.batchDecrypt({
    diffItems: plainCommit.catalog.diffItems,
    pathResolver,
    strictCheck: false,
  })
  await commitAll({
    ...plainCommit.signature,
    amend: shouldAmend,
    cwd: pathResolver.plainRootDir,
    logger,
  })
}
