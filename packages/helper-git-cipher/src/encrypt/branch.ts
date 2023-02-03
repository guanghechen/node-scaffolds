import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IFileCipherCatalog,
  IJsonConfigKeeper,
} from '@guanghechen/helper-cipher-file'
import { getCommitInTopology, showCommitInfo } from '@guanghechen/helper-git'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfigData } from '../types'
import { encryptGitCommit } from './commit'

export interface IEncryptGitBranchParams {
  branchName: string
  plain2cryptIdMap: Map<string, string>
  catalog: IFileCipherCatalog
  cipherBatcher: IFileCipherBatcher
  pathResolver: FileCipherPathResolver
  configKeeper: IJsonConfigKeeper<IGitCipherConfigData>
  multilineMessagePrefix?: string
  logger?: ILogger
}

/**
 * Encrypt git branch.
 *
 * !!! Required (this method is not recommend to use directly)
 *  - Both the plain repo and crypt repo (could be empty) should be clean (no untracked files).
 *  - The plain repo should have the given branch.
 *  - The plain2cryptIdMap and crypt2plainIdMap should be set correctly.
 *
 * @param params
 */
export async function encryptGitBranch(params: IEncryptGitBranchParams): Promise<void> {
  const {
    branchName,
    plain2cryptIdMap,
    catalog,
    cipherBatcher,
    pathResolver,
    configKeeper,
    multilineMessagePrefix,
    logger,
  } = params
  const plainCommitNodes = await getCommitInTopology({
    branchOrCommitId: branchName,
    cwd: pathResolver.plainRootDir,
    logger,
  })

  for (const plainCommitNode of plainCommitNodes) {
    const plainCommitId: string = plainCommitNode.id
    if (!plain2cryptIdMap.has(plainCommitId)) {
      await encryptGitCommit({
        plainCommitNode,
        plain2cryptIdMap,
        catalog,
        cipherBatcher,
        pathResolver,
        configKeeper,
        multilineMessagePrefix,
        logger,
      })
      const { commitId: cryptCommitId } = await showCommitInfo({
        branchOrCommitId: 'HEAD',
        cwd: pathResolver.cryptRootDir,
        logger,
      })
      plain2cryptIdMap.set(plainCommitId, cryptCommitId)
    }
  }
}
