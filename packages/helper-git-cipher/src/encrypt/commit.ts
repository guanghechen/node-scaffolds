import type { ICatalogItem, IDraftCatalogDiffItem } from '@guanghechen/cipher-catalog'
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
import type { IGitCipherConfig, IGitCipherContext } from '../types'
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
  const { catalog, configKeeper, cryptPathResolver, plainPathResolver, reporter } = context
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
    const cipherConfig: IGitCipherConfig = await configKeeper.load()
    invariant(!!cipherConfig, `[${title}] cannot load config. crypt(${cryptParentId})`)

    const items: ICatalogItem[] = await Promise.all(
      cipherConfig.catalog.items.map(
        async (item): Promise<ICatalogItem> => context.catalog.flatItem(item),
      ),
    )
    catalog.reset(items)
  } else {
    catalog.reset()
  }

  const signature: IGitCommitInfo = await showCommitInfo({
    ...plainCmdCtx,
    commitHash: plainCommitNode.id,
  })
  const plainFiles: string[] = await collectChangedPlainFiles()
  const draftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
    plainFiles,
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

  async function collectChangedPlainFiles(): Promise<string[]> {
    if (plainCommitNode.parents.length <= 0) {
      return listAllFiles({ ...plainCmdCtx, commitHash: plainCommitNode.id })
    }
    if (plainCommitNode.parents.length === 1) {
      return listDiffFiles({
        ...plainCmdCtx,
        olderCommitHash: plainCommitNode.parents[0],
        newerCommitHash: plainCommitNode.id,
      })
    }

    const plainFileSet: Set<string> = new Set<string>()
    for (const parentId of plainCommitNode.parents) {
      const plainFiles: string[] = await listDiffFiles({
        ...plainCmdCtx,
        olderCommitHash: parentId,
        newerCommitHash: plainCommitNode.id,
      })
      plainFiles.forEach(plainFile => plainFileSet.add(plainFile))
    }
    return Array.from(plainFileSet)
  }
}
