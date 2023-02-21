import { collectAffectedCryptFilepaths } from '@guanghechen/helper-cipher-file'
import type {
  IFileCipherBatcher,
  IFileCipherCatalog,
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogDiffItemDraft,
  IFileCipherCatalogItem,
  IFileCipherCatalogItemBase,
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
  listAllFiles,
  listDiffFiles,
  mergeCommits,
  showCommitInfo,
} from '@guanghechen/helper-git'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IFileCipherCatalogItemInstance, IGitCipherConfig } from '../types'
import { generateCommitHash as generateCommitMessage } from '../util'

export interface IEncryptGitCommitParams {
  catalog: IFileCipherCatalog
  cipherBatcher: IFileCipherBatcher
  configKeeper: IConfigKeeper<IGitCipherConfig>
  cryptPathResolver: FilepathResolver
  logger: ILogger | undefined
  plainCommitNode: IGitCommitDagNode
  plainPathResolver: FilepathResolver
  plain2cryptIdMap: Map<string, string>
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
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
    catalog,
    cipherBatcher,
    configKeeper,
    cryptPathResolver,
    logger,
    plainCommitNode,
    plainPathResolver,
    plain2cryptIdMap,
    getDynamicIv,
  } = params
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.rootDir, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }

  // [plain] Move the HEAD pointer to the current encrypting commit.
  await checkBranch({ ...plainCmdCtx, branchOrCommitId: plainCommitNode.id })

  const getIv = (item: IFileCipherCatalogItemBase): Buffer =>
    getDynamicIv([Buffer.from(item.plainFilepath, 'hex'), Buffer.from(item.fingerprint, 'hex')])
  const flatItem = (item: IFileCipherCatalogItemInstance): IFileCipherCatalogItem => ({
    ...catalog.flatCatalogItem(item),
    iv: getIv(item),
    authTag: item.authTag,
  })

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

    const items: IFileCipherCatalogItem[] = configData.catalog.items.map(item => flatItem(item))
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
  const draftDiffItems: IFileCipherCatalogDiffItemDraft[] = await catalog.diffFromPlainFiles({
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

  // Update catalog.
  const diffItems: IFileCipherCatalogDiffItem[] = await cipherBatcher.batchEncrypt({
    diffItems: draftDiffItems,
    plainPathResolver,
    cryptPathResolver,
    strictCheck: false,
    getIv,
  })
  catalog.applyDiff(diffItems)

  // Encrypt files & update config.
  const config: IGitCipherConfig = {
    commit: {
      parents: plainCommitNode.parents,
      signature,
    },
    catalog: {
      diffItems,
      items: Array.from(catalog.items).sort((x, y) =>
        x.plainFilepath.localeCompare(y.plainFilepath),
      ),
    },
  }
  await configKeeper.update(config)
  await configKeeper.save()

  const message: string = generateCommitMessage(config.catalog.items)
  await commitAll({
    ...cryptCmdCtx,
    ...config.commit.signature,
    message,
    amend: shouldAmend,
  })
}
