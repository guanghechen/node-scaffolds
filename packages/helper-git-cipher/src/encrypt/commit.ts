import type { ICatalogItem, IDraftCatalogDiffItem } from '@guanghechen/cipher-workspace.types'
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
import type { IGitCipherContext } from '../GitCipherContext'
import { getCryptCommitId } from '../util'
import { internalEncryptDiffItems } from './_internal'

export interface IEncryptGitCommitParams {
  context: IGitCipherContext
  plainCommitNode: IGitCommitDagNode
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
  const { context, plainCommitNode, plain2cryptIdMap } = params
  const { catalog, configKeeper, reporter } = context
  const { cryptPathResolver, plainPathResolver } = catalog.context
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.root, reporter }
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, reporter }

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

    const items: ICatalogItem[] = configData.catalog.items.map(item => context.flatItem(item))
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
  const draftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
    plainFiles.sort(),
    false,
  )
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

  await internalEncryptDiffItems({ context, draftDiffItems, shouldAmend, signature })
}
