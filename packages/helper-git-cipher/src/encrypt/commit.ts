import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IFileCipherCatalog,
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
  IJsonConfigKeeper,
} from '@guanghechen/helper-cipher-file'
import { collectAffectedCryptFilepaths } from '@guanghechen/helper-cipher-file'
import type { IGitCommitDagNode, IGitCommitInfo } from '@guanghechen/helper-git'
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
  multilineMessagePrefix?: string
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
    multilineMessagePrefix,
    logger,
  } = params

  // [plain] Move the HEAD pointer to the current encrypting commit.
  await checkBranch({
    branchOrCommitId: plainCommitNode.id,
    cwd: pathResolver.plainRootDir,
    logger,
  })

  // [crypt] Reset catalog to calc diffItems.
  if (plainCommitNode.parents.length > 0) {
    const plainParentId = plainCommitNode.parents[0]
    const cryptParentId = plain2cryptIdMap.get(plainParentId)
    invariant(
      !!cryptParentId,
      `[encryptGitCommit] unpaired crypt parent commit. plain(${plainParentId}) crypt(${cryptParentId})`,
    )

    await checkBranch({
      branchOrCommitId: cryptParentId,
      cwd: pathResolver.cryptRootDir,
      logger,
    })

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
    branchOrCommitId: plainCommitNode.id,
    messagePrefix: multilineMessagePrefix,
    cwd: pathResolver.plainRootDir,
    logger,
  })
  const plainFiles: string[] =
    plainCommitNode.parents.length > 0
      ? await listDiffFiles({
          branchOrCommitId1: plainCommitNode.id,
          branchOrCommitId2: plainCommitNode.parents[0],
          cwd: pathResolver.plainRootDir,
          logger,
        })
      : await listAllFiles({
          branchOrCommitId: plainCommitNode.id,
          cwd: pathResolver.plainRootDir,
          logger,
        })
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
      ...commit.signature,
      parentIds: cryptParentCommitIds,
      strategy: 'ours',
      cwd: pathResolver.cryptRootDir,
      logger,
    })
    shouldAmend = true
  }

  // [crypt] Clean untracked filepaths to avoid unexpected errors.
  const cryptFiles: string[] = collectAffectedCryptFilepaths(diffItems)
  await cleanUntrackedFilepaths({
    filepaths: cryptFiles,
    cwd: pathResolver.cryptRootDir,
    logger,
  })

  // Encrypt files & update config.
  await cipherBatcher.batchEncrypt({ diffItems, pathResolver, strictCheck: false })
  await configKeeper.save({ commit })
  await commitAll({
    ...commit.signature,
    message: `#${commit.id}`,
    amend: shouldAmend,
    cwd: pathResolver.cryptRootDir,
    logger,
  })
}
