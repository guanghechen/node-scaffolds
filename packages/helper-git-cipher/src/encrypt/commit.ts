import type {
  IFileCipherCatalog,
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
  listAllFiles,
  listDiffFiles,
  mergeCommits,
  showCommitInfo,
} from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import type { IGitCipherContext } from '../GitCipherContext'
import { getCryptCommitId } from '../util'
import { internalEncryptDiffItems } from './_internal'

export interface IEncryptGitCommitParams {
  catalog: IFileCipherCatalog
  context: IGitCipherContext
  cryptPathResolver: IWorkspacePathResolver
  plainCommitNode: IGitCommitDagNode
  plainPathResolver: IWorkspacePathResolver
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
  const { configKeeper, logger } = context
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.root, logger }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, logger }

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

  await internalEncryptDiffItems({
    catalog,
    context,
    cryptPathResolver,
    draftDiffItems,
    plainPathResolver,
    shouldAmend,
    signature,
  })
}
