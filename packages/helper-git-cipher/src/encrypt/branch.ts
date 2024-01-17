import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { getCommitInTopology, showCommitInfo } from '@guanghechen/helper-git'
import type { IGitCipherContext } from '../types'
import { encryptGitCommit } from './commit'

export interface IEncryptGitBranchParams {
  branchName: string
  context: IGitCipherContext
  plain2cryptIdMap: Map<string, string>
}

/**
 * Encrypt git branch.
 *
 * !!!Requirement (this method is not recommend to use directly)
 *  - Both the plain repo and crypt repo (could be empty) should be clean (no untracked files).
 *  - The plain repo should have the given branch.
 *  - The plain2cryptIdMap and crypt2plainIdMap should be set correctly.
 *
 * @param params
 */
export async function encryptGitBranch(params: IEncryptGitBranchParams): Promise<void> {
  const { branchName, context, plain2cryptIdMap } = params
  const { cryptPathResolver, plainPathResolver, reporter } = context
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.root, reporter }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, reporter }

  const plainCommitNodes = await getCommitInTopology({
    ...plainCmdCtx,
    commitHash: branchName,
  })

  for (const plainCommitNode of plainCommitNodes) {
    const plainCommitId: string = plainCommitNode.id
    if (!plain2cryptIdMap.has(plainCommitId)) {
      await encryptGitCommit({ context, plainCommitNode, plain2cryptIdMap })
      const { commitId: cryptCommitId } = await showCommitInfo({
        ...cryptCmdCtx,
        commitHash: 'HEAD',
      })
      plain2cryptIdMap.set(plainCommitId, cryptCommitId)
    }
  }
}
