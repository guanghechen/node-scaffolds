import type { ICipherCatalog } from '@guanghechen/cipher-workspace.types'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { getCommitInTopology, showCommitInfo } from '@guanghechen/helper-git'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import type { IGitCipherContext } from '../GitCipherContext'
import { encryptGitCommit } from './commit'

export interface IEncryptGitBranchParams {
  branchName: string
  catalog: ICipherCatalog
  context: IGitCipherContext
  cryptPathResolver: IWorkspacePathResolver
  plainPathResolver: IWorkspacePathResolver
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
  const { branchName, catalog, context, cryptPathResolver, plain2cryptIdMap, plainPathResolver } =
    params
  const { reporter } = context
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.root, reporter }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, reporter }

  const plainCommitNodes = await getCommitInTopology({
    ...plainCmdCtx,
    commitHash: branchName,
  })

  for (const plainCommitNode of plainCommitNodes) {
    const plainCommitId: string = plainCommitNode.id
    if (!plain2cryptIdMap.has(plainCommitId)) {
      await encryptGitCommit({
        catalog,
        context,
        cryptPathResolver,
        plainCommitNode,
        plain2cryptIdMap,
        plainPathResolver,
      })
      const { commitId: cryptCommitId } = await showCommitInfo({
        ...cryptCmdCtx,
        commitHash: 'HEAD',
      })
      plain2cryptIdMap.set(plainCommitId, cryptCommitId)
    }
  }
}
