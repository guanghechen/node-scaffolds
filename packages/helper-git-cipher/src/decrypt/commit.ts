import { FileChangeType, collectAffectedPlainFilepaths } from '@guanghechen/helper-cipher-file'
import type {
  IFileCipherBatcher,
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogItem,
  IFileCipherCatalogItemBase,
  IReadonlyFileCipherCatalog,
} from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import type {
  IGitCommandBaseParams,
  IGitCommitDagNode,
  IGitCommitInfo,
} from '@guanghechen/helper-git'
import {
  checkBranch,
  cleanUntrackedFilepaths,
  commitAll,
  getParentCommitIdList,
  mergeCommits,
  showCommitInfo,
} from '@guanghechen/helper-git'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IFileCipherCatalogItemInstance, IGitCipherConfig } from '../types'
import { getPlainCommitId } from '../util'

export interface IDecryptGitCommitParams {
  catalog: IReadonlyFileCipherCatalog
  cipherBatcher: IFileCipherBatcher
  configKeeper: IConfigKeeper<IGitCipherConfig>
  cryptCommitNode: IGitCommitDagNode
  cryptPathResolver: FilepathResolver
  crypt2plainIdMap: Map<string, string>
  logger: ILogger | undefined
  plainPathResolver: FilepathResolver
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
}

/**
 * Decrypt git commit.
 *
 * !!! Required (this method is not recommend to use directly)
 *  - Both the plain repo (could be empty) and crypt repo should be clean (no untracked files).
 *
 * @param params
 */
export async function decryptGitCommit(params: IDecryptGitCommitParams): Promise<void> {
  const {
    catalog,
    cipherBatcher,
    configKeeper,
    cryptCommitNode,
    cryptPathResolver,
    crypt2plainIdMap,
    logger,
    plainPathResolver,
    getDynamicIv,
  } = params
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.rootDir, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }

  // [crypt] Move the HEAD pointer to the current decrypting commit.
  await checkBranch({ ...cryptCmdCtx, commitHash: cryptCommitNode.id })
  const signature: IGitCommitInfo = await showCommitInfo({
    ...cryptCmdCtx,
    commitHash: cryptCommitNode.id,
  })

  const getIv = (item: IFileCipherCatalogItemBase): Buffer =>
    getDynamicIv([Buffer.from(item.plainFilepath, 'utf8'), Buffer.from(item.fingerprint, 'hex')])
  const flatItem = (item: IFileCipherCatalogItemInstance): IFileCipherCatalogItem => ({
    ...item,
    cryptFilepath: catalog.calcCryptFilepath(item),
    iv: getIv(item),
    authTag: item.authTag,
  })

  // Load the diffItems between the <first parent>...<current>.
  await configKeeper.load()
  const configData = configKeeper.data
  invariant(
    !!configData,
    `[decryptGitCommit] cannot load config. cryptCommitId(${cryptCommitNode.id})`,
  )

  // [plain] Move the HEAD pointer to the first parent commit for creating commit or merging.
  const { message } = configData.commit
  const cryptParentIds: string[] = await getParentCommitIdList({
    ...cryptCmdCtx,
    commitHash: cryptCommitNode.id,
  })
  const plainParents = cryptParentIds.map(cryptParentId =>
    getPlainCommitId(cryptParentId, crypt2plainIdMap),
  )

  if (plainParents.length > 0) {
    await checkBranch({ ...plainCmdCtx, commitHash: plainParents[0] })
  }

  let shouldAmend = false
  if (plainParents.length > 1) {
    await mergeCommits({
      ...plainCmdCtx,
      ...signature,
      message,
      parentIds: plainParents,
      strategy: 'ours',
    })
    shouldAmend = true
  }

  // [pain] Clean untracked filepaths to avoid unexpected errors.
  const diffItems = configData.catalog.diffItems.map((diffItem): IFileCipherCatalogDiffItem => {
    switch (diffItem.changeType) {
      case FileChangeType.ADDED:
        return {
          changeType: FileChangeType.ADDED,
          newItem: flatItem(diffItem.newItem),
        }
      case FileChangeType.MODIFIED:
        return {
          changeType: FileChangeType.MODIFIED,
          oldItem: flatItem(diffItem.oldItem),
          newItem: flatItem(diffItem.newItem),
        }
      case FileChangeType.REMOVED:
        return {
          changeType: FileChangeType.REMOVED,
          oldItem: flatItem(diffItem.oldItem),
        }
      /* c8 ignore start */
      default:
        throw new Error(`[decryptGitCommit] unexpected changeType. ${diffItem['changeType']}`)
      /* c8 ignore end */
    }
  })
  const affectedPlainFiles: string[] = collectAffectedPlainFilepaths(diffItems)
  await cleanUntrackedFilepaths({ ...plainCmdCtx, filepaths: affectedPlainFiles })

  // Decrypt files.
  await cipherBatcher.batchDecrypt({
    strictCheck: false,
    plainPathResolver,
    cryptPathResolver,
    diffItems,
  })
  await commitAll({ ...plainCmdCtx, ...signature, message, amend: shouldAmend })
}
