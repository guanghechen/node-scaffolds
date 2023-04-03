import type { IFileCipherBatcher, IFileCipherCatalogContext } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { getCommitInTopology, showCommitInfo } from '@guanghechen/helper-git'
import type { FilepathResolver } from '@guanghechen/helper-path'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfig } from '../types'
import { decryptGitCommit } from './commit'

export interface IDecryptGitBranchParams {
  branchName: string
  catalogContext: IFileCipherCatalogContext
  cipherBatcher: IFileCipherBatcher
  configKeeper: IConfigKeeper<IGitCipherConfig>
  cryptPathResolver: FilepathResolver
  crypt2plainIdMap: Map<string, string>
  logger: ILogger | undefined
  plainPathResolver: FilepathResolver
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
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
    catalogContext,
    cipherBatcher,
    configKeeper,
    cryptPathResolver,
    crypt2plainIdMap,
    logger,
    plainPathResolver,
    getDynamicIv,
  } = params
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.rootDir, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }

  const cryptCommitNodes = await getCommitInTopology({
    ...cryptCmdCtx,
    commitHash: branchName,
  })

  for (const cryptCommitNode of cryptCommitNodes) {
    const cryptCommitId: string = cryptCommitNode.id
    if (!crypt2plainIdMap.has(cryptCommitId)) {
      await decryptGitCommit({
        catalogContext,
        cryptCommitNode,
        cipherBatcher,
        configKeeper,
        cryptPathResolver,
        crypt2plainIdMap,
        logger,
        plainPathResolver,
        getDynamicIv,
      })

      const { commitId: plainCommitId } = await showCommitInfo({
        ...plainCmdCtx,
        commitHash: 'HEAD',
      })
      crypt2plainIdMap.set(cryptCommitId, plainCommitId)
    }
  }
}
