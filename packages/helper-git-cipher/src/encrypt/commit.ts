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
import { generateCommitHash as generateCommitMessage, getCryptCommitId } from '../util'

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
  await checkBranch({ ...plainCmdCtx, commitHash: plainCommitNode.id })

  const getIv = (item: IFileCipherCatalogItemBase): Buffer =>
    getDynamicIv([Buffer.from(item.plainFilepath, 'utf8'), Buffer.from(item.fingerprint, 'hex')])
  const flatItem = (item: IFileCipherCatalogItemInstance): IFileCipherCatalogItem => ({
    ...item,
    cryptFilepath: catalog.calcCryptFilepath(item),
    iv: getIv(item),
    authTag: item.authTag,
  })

  // [crypt] Reset catalog to calc diffItems.
  if (plainCommitNode.parents.length > 0) {
    const plainParentId = plainCommitNode.parents[0]
    const cryptParentId = getCryptCommitId(plainParentId, plain2cryptIdMap)
    await checkBranch({ ...cryptCmdCtx, commitHash: cryptParentId })

    // Load the diffItems between the <first parent>...<current>.
    await configKeeper.load()
    const configData = configKeeper.data
    invariant(!!configData, `[encryptGitCommit] cannot load config. crypt(${cryptParentId})`)

    const items: IFileCipherCatalogItem[] = configData.catalog.items.map(item => flatItem(item))
    catalog.reset(items)
  } else {
    catalog.reset()
  }

  const signature: IGitCommitInfo = await showCommitInfo({
    ...plainCmdCtx,
    commitHash: plainCommitNode.id,
  })
  const plainFiles: string[] =
    plainCommitNode.parents.length > 0
      ? await listDiffFiles({
          ...plainCmdCtx,
          olderCommitHash: plainCommitNode.parents[0],
          newerCommitHash: plainCommitNode.id,
        })
      : await listAllFiles({ ...plainCmdCtx, commitHash: plainCommitNode.id })
  const draftDiffItems: IFileCipherCatalogDiffItemDraft[] = await catalog.diffFromPlainFiles({
    plainFilepaths: plainFiles.sort(),
    strickCheck: false,
  })

  const cryptParentCommitIds: string[] = plainCommitNode.parents.map(plainParentId =>
    getCryptCommitId(plainParentId, plain2cryptIdMap),
  )

  let shouldAmend = false
  if (cryptParentCommitIds.length > 1) {
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
      message: signature.message,
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
  await commitAll({ ...cryptCmdCtx, ...signature, message, amend: shouldAmend })
}
