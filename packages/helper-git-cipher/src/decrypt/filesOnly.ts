import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IJsonConfigKeeper,
} from '@guanghechen/helper-cipher-file'
import { FileChangeType } from '@guanghechen/helper-cipher-file'
import { checkBranch, hasUncommittedContent, isGitRepo } from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfigData } from '../types'

export interface IDecryptFilesOnlyParams {
  cryptCommitId: string
  cipherBatcher: IFileCipherBatcher
  pathResolver: FileCipherPathResolver
  configKeeper: IJsonConfigKeeper<IGitCipherConfigData>
  logger?: ILogger
}

/**
 * Decrypt files at the given commit id.
 *
 * @param params
 */
export async function decryptFilesOnly(params: IDecryptFilesOnlyParams): Promise<void> {
  const { cryptCommitId, pathResolver, cipherBatcher, configKeeper, logger } = params
  invariant(
    isGitRepo(pathResolver.cryptRootDir),
    `[decryptFilesOnly] crypt repo is not a git repo. (${pathResolver.cryptRootDir})`,
  )

  invariant(
    !(await hasUncommittedContent({ cwd: pathResolver.cryptRootDir, logger })),
    '[decryptFilesOnly] crypt repo has uncommitted contents.',
  )

  // [crypt] Move the HEAD pointer to the current decrypting commit.
  await checkBranch({ branchOrCommitId: cryptCommitId, cwd: pathResolver.cryptRootDir, logger })

  // Load the diffItems between the <first parent>...<current>.
  const configData = await configKeeper.load()
  invariant(
    configData !== null,
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
}
