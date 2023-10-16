import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { getCommitInTopology, showCommitInfo } from '@guanghechen/helper-git'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import type { IGitCipherContext } from '../GitCipherContext'
import { decryptGitCommit } from './commit'

export interface IDecryptGitBranchParams {
  branchName: string
  context: IGitCipherContext
  cryptPathResolver: IWorkspacePathResolver
  crypt2plainIdMap: Map<string, string>
  plainPathResolver: IWorkspacePathResolver
}

/**
 * Decrypt a git branch.
 *
 * !!!Requirement (this method is not recommend to use directly)
 *  - Both the plain repo (could be empty) and crypt repo should be clean (no untracked files).
 *  - The crypt repo should have the given branch.
 *  - The plainIdSet and crypt2plainIdMap should be set correctly.
 *
 * @param params
 */
export async function decryptGitBranch(params: IDecryptGitBranchParams): Promise<void> {
  const { branchName, context, crypt2plainIdMap, cryptPathResolver, plainPathResolver } = params
  const { logger } = context
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.root, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, logger }

  const cryptCommitNodes = await getCommitInTopology({
    ...cryptCmdCtx,
    commitHash: branchName,
  })

  for (const cryptCommitNode of cryptCommitNodes) {
    const cryptCommitId: string = cryptCommitNode.id
    if (!crypt2plainIdMap.has(cryptCommitId)) {
      await decryptGitCommit({
        context,
        cryptCommitNode,
        crypt2plainIdMap,
        cryptPathResolver,
        plainPathResolver,
      })
      const { commitId: plainCommitId } = await showCommitInfo({
        ...plainCmdCtx,
        commitHash: 'HEAD',
      })
      crypt2plainIdMap.set(cryptCommitId, plainCommitId)
    }
  }
}
