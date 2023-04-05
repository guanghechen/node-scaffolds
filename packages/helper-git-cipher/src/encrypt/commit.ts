import { collectAffectedCryptFilepaths } from '@guanghechen/helper-cipher-file'
import type {
  IFileCipherCatalog,
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogDiffItemDraft,
  IFileCipherCatalogItem,
} from '@guanghechen/helper-cipher-file'
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
import type { IGitCipherContext } from '../GitCipherContext'
import type { IGitCipherConfig } from '../types'
import { generateCommitHash, getCryptCommitId } from '../util'

export interface IEncryptGitCommitParams {
  catalog: IFileCipherCatalog
  context: IGitCipherContext
  cryptPathResolver: FilepathResolver
  plainCommitNode: IGitCommitDagNode
  plainPathResolver: FilepathResolver
  plain2cryptIdMap: ReadonlyMap<string, string>
}

/**
 * Encrypt git commit.
 *
 * !!!Requirement (this method is not recommend to use directly)
 *  - Both the plain repo and crypt repo (could be empty) should be clean (no untracked files).
 *  - The plain2cryptIdMap and crypt2plainIdMap should be set correctly.
 */
export async function encryptGitCommit(params: IEncryptGitCommitParams): Promise<void> {
  const title = 'encryptGitCommit'
  const {
    catalog,
    context,
    cryptPathResolver,
    plainCommitNode,
    plain2cryptIdMap,
    plainPathResolver,
  } = params
  const { cipherBatcher, configKeeper, logger, getIv } = context
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.rootDir, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }

  // [plain] Move the HEAD pointer to the current encrypting commit.
  await checkBranch({ ...plainCmdCtx, commitHash: plainCommitNode.id })

  // [crypt] Reset catalog to calc diffItems.
  if (plainCommitNode.parents.length > 0) {
    const plainParentId = plainCommitNode.parents[0]
    const cryptParentId = getCryptCommitId(plainParentId, plain2cryptIdMap)
    await checkBranch({ ...cryptCmdCtx, commitHash: cryptParentId })

    // Load the diffItems between the <first parent>...<current>.
    await configKeeper.load()
    const configData = configKeeper.data
    invariant(!!configData, `[${title}] cannot load config. crypt(${cryptParentId})`)

    const items: IFileCipherCatalogItem[] = configData.catalog.items.map(item =>
      context.flatItem(item),
    )
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
      items: Array.from(catalog.items),
    },
  }
  await configKeeper.update(config)
  await configKeeper.save()

  const cryptMessage: string = generateCommitHash(config.catalog.items)
  await commitAll({ ...cryptCmdCtx, ...signature, message: cryptMessage, amend: shouldAmend })
}
