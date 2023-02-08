import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IFileCipherCatalog,
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
  IJsonConfigKeeper,
} from '@guanghechen/helper-cipher-file'
import { collectAffectedCryptFilepaths } from '@guanghechen/helper-cipher-file'
import type {
  IGitCommandBaseParams,
  IGitCommitDagNode,
  IGitCommitInfo,
} from '@guanghechen/helper-git'
import {
  checkBranch,
  cleanUntrackedFilepaths,
  commitAll,
  listAllFiles,
  listDiffFiles,
  mergeCommits,
  showCommitInfo,
} from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfigData, IGitCommitOverview } from '../types'

export interface IEncryptGitCommitParams {
  plainCommitNode: IGitCommitDagNode
  plain2cryptIdMap: Map<string, string>
  catalog: IFileCipherCatalog
  cipherBatcher: IFileCipherBatcher
  pathResolver: FileCipherPathResolver
  configKeeper: IJsonConfigKeeper<IGitCipherConfigData>
  logger?: ILogger
}

/**
 * Encrypt git commit.
 *
 * !!!Required (this method is not recommend to use directly)
 *  - Both the plain repo and crypt repo (could be empty) should be clean (no untracked files).
 *  - The plain2cryptIdMap and crypt2plainIdMap should be set correctly.
 *
 * @param params
 */
export async function encryptGitCommit(params: IEncryptGitCommitParams): Promise<void> {
  const {
    plainCommitNode,
    plain2cryptIdMap,
    catalog,
    cipherBatcher,
    pathResolver,
    configKeeper,
    logger,
  } = params
  const plainCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.plainRootDir, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.cryptRootDir, logger }

  // [plain] Move the HEAD pointer to the current encrypting commit.
  await checkBranch({ ...plainCmdCtx, branchOrCommitId: plainCommitNode.id })

  // [crypt] Reset catalog to calc diffItems.
  if (plainCommitNode.parents.length > 0) {
    const plainParentId = plainCommitNode.parents[0]
    const cryptParentId = plain2cryptIdMap.get(plainParentId)
    invariant(
      !!cryptParentId,
      `[encryptGitCommit] unpaired crypt parent commit. plain(${plainParentId}) crypt(${cryptParentId})`,
    )

    await checkBranch({ ...cryptCmdCtx, branchOrCommitId: cryptParentId })

    // Load the diffItems between the <first parent>...<current>.
    const configData = await configKeeper.load()
    invariant(
      configData !== null,
      `[encryptGitCommit] cannot load config. filepath(${configKeeper.filepath}), crypt(${cryptParentId})`,
    )
    const items: IFileCipherCatalogItem[] = configData.commit.catalog.items
    catalog.reset(items)
  } else {
    catalog.reset()
  }

  const signature: IGitCommitInfo = await showCommitInfo({
    ...plainCmdCtx,
    branchOrCommitId: plainCommitNode.id,
  })
  const plainFiles: string[] =
    plainCommitNode.parents.length > 0
      ? await listDiffFiles({
          ...plainCmdCtx,
          branchOrCommitId1: plainCommitNode.id,
          branchOrCommitId2: plainCommitNode.parents[0],
        })
      : await listAllFiles({ ...plainCmdCtx, branchOrCommitId: plainCommitNode.id })
  const diffItems: IFileCipherCatalogItemDiff[] = await catalog.diffFromPlainFiles({
    plainFilepaths: plainFiles.sort(),
    strickCheck: false,
  })
  catalog.applyDiff(diffItems)
  const commit: IGitCommitOverview = {
    id: plainCommitNode.id,
    parents: plainCommitNode.parents,
    signature,
    catalog: {
      diffItems,
      items: Array.from(catalog.items).sort((x, y) =>
        x.plainFilepath.localeCompare(y.plainFilepath),
      ),
    },
  }

  let shouldAmend = false
  if (commit.parents.length > 1) {
    const cryptParentCommitIds: string[] = []
    for (const plainParentId of commit.parents) {
      const cryptParentId: string | undefined = plain2cryptIdMap.get(plainParentId)
      invariant(
        cryptParentId !== undefined,
        `[encryptGitCommit] unpaired crypt parent id: source(${plainParentId}), crypt(${cryptParentId})`,
      )
      cryptParentCommitIds.push(cryptParentId)
    }

    await mergeCommits({
      ...cryptCmdCtx,
      ...commit.signature,
      parentIds: cryptParentCommitIds,
      strategy: 'ours',
    })
    shouldAmend = true
  }

  // [crypt] Clean untracked filepaths to avoid unexpected errors.
  const cryptFiles: string[] = collectAffectedCryptFilepaths(diffItems)
  await cleanUntrackedFilepaths({ ...cryptCmdCtx, filepaths: cryptFiles })

  // Encrypt files & update config.
  await cipherBatcher.batchEncrypt({ diffItems, pathResolver, strictCheck: false })
  await configKeeper.save({ commit })
  await commitAll({
    ...cryptCmdCtx,
    ...commit.signature,
    message: `#${commit.id}`,
    amend: shouldAmend,
  })
}
