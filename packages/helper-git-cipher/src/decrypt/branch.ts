import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { getCommitInTopology, showCommitInfo } from '@guanghechen/helper-git'
import type { IGitCipherContext } from '../types'
import { decryptGitCommit } from './commit'

export interface IDecryptGitBranchParams {
  branchName: string
  context: IGitCipherContext
  crypt2plainIdMap: Map<string, string>
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
  const { branchName, context, crypt2plainIdMap } = params
  const { catalog, reporter } = context
  const { cryptPathResolver, plainPathResolver } = catalog.context
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.root, reporter }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, reporter }

  const cryptCommitNodes = await getCommitInTopology({
    ...cryptCmdCtx,
    commitHash: branchName,
  })

  for (const cryptCommitNode of cryptCommitNodes) {
    const cryptCommitId: string = cryptCommitNode.id
    if (!crypt2plainIdMap.has(cryptCommitId)) {
      await decryptGitCommit({ context, cryptCommitNode, crypt2plainIdMap })
      const { commitId: plainCommitId } = await showCommitInfo({
        ...plainCmdCtx,
        commitHash: 'HEAD',
      })
      crypt2plainIdMap.set(cryptCommitId, plainCommitId)
    }
  }
}
