import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IJsonConfigKeeper,
} from '@guanghechen/helper-cipher-file'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { getCommitInTopology, showCommitInfo } from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfigData } from '../types'
import { decryptGitCommit } from './commit'

export interface IDecryptGitBranchParams {
  branchName: string
  crypt2plainIdMap: Map<string, string>
  plainIdSet: Set<string>
  cipherBatcher: IFileCipherBatcher
  pathResolver: FileCipherPathResolver
  configKeeper: IJsonConfigKeeper<IGitCipherConfigData>
  logger?: ILogger
}

/**
 * Decrypt a git branch.
 *
 * !!! Required (this method is not recommend to use directly)
 *  - Both the plain repo (could be empty) and crypt repo should be clean (no untracked files).
 *  - The crypt repo should have the given branch.
 *  - The plainIdSet and crypt2plainIdMap should be set correctly.
 *
 * @param params
 */
export async function decryptGitBranch(params: IDecryptGitBranchParams): Promise<void> {
  const {
    branchName,
    crypt2plainIdMap,
    plainIdSet,
    cipherBatcher,
    configKeeper,
    pathResolver,
    logger,
  } = params
  const plainCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.plainRootDir, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.cryptRootDir, logger }

  const cryptCommitNodes = await getCommitInTopology({
    ...cryptCmdCtx,
    branchOrCommitId: branchName,
  })

  for (const cryptCommitNode of cryptCommitNodes) {
    const expectedPlainCommitId: string = crypt2plainIdMap.get(cryptCommitNode.id)!
    if (!plainIdSet.has(expectedPlainCommitId)) {
      await decryptGitCommit({
        cryptCommitNode,
        cipherBatcher,
        configKeeper,
        pathResolver,
        logger,
      })

      const { commitId: plainCommitId } = await showCommitInfo({
        ...plainCmdCtx,
        branchOrCommitId: 'HEAD',
      })
      plainIdSet.add(plainCommitId)

      invariant(
        expectedPlainCommitId === plainCommitId,
        `[decryptGitBranch] unmatched plain commit id in branch (${branchName}). expected(${expectedPlainCommitId}), received(${plainCommitId})`,
      )
    }
  }
}
