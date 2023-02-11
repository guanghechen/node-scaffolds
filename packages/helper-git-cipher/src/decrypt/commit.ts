import { collectAffectedPlainFilepaths } from '@guanghechen/helper-cipher-file'
import type { FileCipherPathResolver, IFileCipherBatcher } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import type { IGitCommandBaseParams, IGitCommitDagNode } from '@guanghechen/helper-git'
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
  configKeeper: IConfigKeeper<IGitCipherConfigData>
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
  const plainCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.plainRootDir, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.cryptRootDir, logger }

  // [crypt] Move the HEAD pointer to the current decrypting commit.
  await checkBranch({ ...cryptCmdCtx, branchOrCommitId: cryptCommitNode.id })

  // Load the diffItems between the <first parent>...<current>.
  await configKeeper.load()
  const configData = configKeeper.data
  invariant(
    !!configData,
    `[decryptGitCommit] cannot load config. filepath(${configKeeper.filepath}), cryptCommitId(${cryptCommitNode.id})`,
  )
  const { commit: plainCommit } = configData

  // [plain] Move the HEAD pointer to the first parent commit for creating commit or merging.
  if (plainCommit.parents.length > 0) {
    await checkBranch({ ...plainCmdCtx, branchOrCommitId: plainCommit.parents[0] })
  }

  let shouldAmend = false
  if (plainCommit.parents.length > 1) {
    await mergeCommits({
      ...plainCmdCtx,
      ...plainCommit.signature,
      parentIds: plainCommit.parents,
      strategy: 'ours',
    })
    shouldAmend = true
  }

  // [pain] Clean untracked filepaths to avoid unexpected errors.
  const affectedPlainFiles: string[] = collectAffectedPlainFilepaths(plainCommit.catalog.diffItems)
  await cleanUntrackedFilepaths({ ...plainCmdCtx, filepaths: affectedPlainFiles })

  // Decrypt files.
  await cipherBatcher.batchDecrypt({
    diffItems: plainCommit.catalog.diffItems,
    pathResolver,
    strictCheck: false,
  })
  await commitAll({ ...plainCmdCtx, ...plainCommit.signature, amend: shouldAmend })
}
