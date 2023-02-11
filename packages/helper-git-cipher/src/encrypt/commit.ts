import { calcMac } from '@guanghechen/helper-cipher'
import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IFileCipherCatalog,
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
  IFileCipherCatalogItemDiffDraft,
} from '@guanghechen/helper-cipher-file'
import { collectAffectedCryptFilepaths } from '@guanghechen/helper-cipher-file'
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
  listAllFiles,
  listDiffFiles,
  mergeCommits,
  showCommitInfo,
} from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfigData, IGitCommitOverview } from '../types'
import { generateCommitHash as generateCommitMessage } from '../util'

export interface IEncryptGitCommitParams {
  plainCommitNode: IGitCommitDagNode
  plain2cryptIdMap: Map<string, string>
  catalog: IFileCipherCatalog
  cipherBatcher: IFileCipherBatcher
  pathResolver: FileCipherPathResolver
  configKeeper: IConfigKeeper<IGitCipherConfigData>
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
    await configKeeper.load()
    const configData = configKeeper.data
    invariant(
      !!configData,
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
  const draftDiffItems: IFileCipherCatalogItemDiffDraft[] = await catalog.diffFromPlainFiles({
    plainFilepaths: plainFiles.sort(),
    strickCheck: false,
  })

  let shouldAmend = false
  const cryptParentCommitIds: string[] = []
  if (plainCommitNode.parents.length > 1) {
    for (const plainParentId of plainCommitNode.parents) {
      const cryptParentId: string | undefined = plain2cryptIdMap.get(plainParentId)
      invariant(
        cryptParentId !== undefined,
        `[encryptGitCommit] unpaired crypt parent id: source(${plainParentId}), crypt(${cryptParentId})`,
      )
      cryptParentCommitIds.push(cryptParentId)
    }

    await mergeCommits({
      ...cryptCmdCtx,
      ...signature,
      parentIds: cryptParentCommitIds,
      strategy: 'ours',
    })
    shouldAmend = true
  }

  // [crypt] Clean untracked filepaths to avoid unexpected errors.
  const cryptFiles: string[] = collectAffectedCryptFilepaths(draftDiffItems)
  await cleanUntrackedFilepaths({ ...cryptCmdCtx, filepaths: cryptFiles })

  // Encrypt files & update config.
  const diffItems: IFileCipherCatalogItemDiff[] = await cipherBatcher.batchEncrypt({
    diffItems: draftDiffItems,
    pathResolver,
    strictCheck: false,
    getIv: item => {
      const mac: Buffer = calcMac(
        ...cryptParentCommitIds.map(id => Buffer.from(id, 'hex')),
        Buffer.from(item.plainFilepath, 'hex'),
        Buffer.from(item.fingerprint, 'hex'),
      )
      return mac.slice(0, 12)
    },
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
  await configKeeper.update({ commit })
  await configKeeper.save()

  const message: string = generateCommitMessage(commit.catalog.items)
  await commitAll({
    ...cryptCmdCtx,
    ...commit.signature,
    message,
    amend: shouldAmend,
  })
}
