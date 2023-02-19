import type { IFileCipherBatcher, IFileCipherCatalog } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { getCommitInTopology, showCommitInfo } from '@guanghechen/helper-git'
import type { FilepathResolver } from '@guanghechen/helper-path'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfig } from '../types'
import { encryptGitCommit } from './commit'

export interface IEncryptGitBranchParams {
  branchName: string
  catalog: IFileCipherCatalog
  cipherBatcher: IFileCipherBatcher
  configKeeper: IConfigKeeper<IGitCipherConfig>
  cryptPathResolver: FilepathResolver
  logger: ILogger | undefined
  plainPathResolver: FilepathResolver
  plain2cryptIdMap: Map<string, string>
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
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
    catalog,
    cipherBatcher,
    configKeeper,
    cryptPathResolver,
    logger,
    plainPathResolver,
    plain2cryptIdMap,
    getDynamicIv,
  } = params
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.rootDir, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }

  const plainCommitNodes = await getCommitInTopology({
    ...plainCmdCtx,
    branchOrCommitId: branchName,
  })

  for (const plainCommitNode of plainCommitNodes) {
    const plainCommitId: string = plainCommitNode.id
    if (!plain2cryptIdMap.has(plainCommitId)) {
      await encryptGitCommit({
        catalog,
        cipherBatcher,
        configKeeper,
        cryptPathResolver,
        logger,
        plainCommitNode,
        plainPathResolver,
        plain2cryptIdMap,
        getDynamicIv,
      })
      const { commitId: cryptCommitId } = await showCommitInfo({
        ...cryptCmdCtx,
        branchOrCommitId: 'HEAD',
      })
      plain2cryptIdMap.set(plainCommitId, cryptCommitId)
    }
  }
}
