import type { FileCipherPathResolver, IFileCipherBatcher } from '@guanghechen/helper-cipher-file'
import { FileChangeType } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import {
  checkBranch,
  getHeadBranchOrCommitId,
  hasUncommittedContent,
  isGitRepo,
} from '@guanghechen/helper-git'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfigData } from '../types'

export interface IDecryptFilesOnlyParams {
  cryptCommitId: string
  cipherBatcher: IFileCipherBatcher
  pathResolver: FileCipherPathResolver
  configKeeper: IConfigKeeper<IGitCipherConfigData>
  logger?: ILogger
}

/**
 * Decrypt files at the given commit id.
 *
 * @param params
 */
export async function decryptFilesOnly(params: IDecryptFilesOnlyParams): Promise<void> {
  const { cryptCommitId, pathResolver, cipherBatcher, configKeeper, logger } = params
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.cryptRootDir, logger }

  invariant(
    isGitRepo(pathResolver.cryptRootDir),
    `[decryptFilesOnly] crypt repo is not a git repo. (${pathResolver.cryptRootDir})`,
  )

  invariant(
    !(await hasUncommittedContent(cryptCmdCtx)),
    '[decryptFilesOnly] crypt repo has uncommitted contents.',
  )

  const initialHeadBranchOrCommitId: string = await getHeadBranchOrCommitId(cryptCmdCtx)
  try {
    // [crypt] Move the HEAD pointer to the current decrypting commit.
    await checkBranch({ ...cryptCmdCtx, branchOrCommitId: cryptCommitId })

    // Load the diffItems between the <first parent>...<current>.
    await configKeeper.load()
    const configData = configKeeper.data
    invariant(
      !!configData,
      `[decryptFilesOnly] cannot load config. filepath(${configKeeper.filepath}), encryptedCommitId(${cryptCommitId})`,
    )
    const { commit: plainCommit } = configData

    // Decrypt files.
    await cipherBatcher.batchDecrypt({
      diffItems: plainCommit.catalog.items.map(item => ({
        changeType: FileChangeType.ADDED,
        newItem: item,
      })),
      pathResolver,
      strictCheck: false,
    })
  } finally {
    // Restore crypt repo HEAD point.
    await checkBranch({ ...cryptCmdCtx, branchOrCommitId: initialHeadBranchOrCommitId })
  }
}
