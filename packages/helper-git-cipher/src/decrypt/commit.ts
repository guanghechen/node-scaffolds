import type { ICatalogItem } from '@guanghechen/cipher-catalog'
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
  showFileContent,
} from '@guanghechen/helper-git'
import { invariant } from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IGitCipherConfig, IGitCipherContext } from '../types'
import { getPlainCommitId } from '../util'

export interface IDecryptGitCommitParams {
  readonly context: IGitCipherContext
  readonly cryptCommitNode: IGitCommitDagNode
  readonly crypt2plainIdMap: Map<string, string>
}

/**
 * Decrypt git commit.
 *
 * !!!Requirement (this method is not recommend to use directly)
 *  - Both the plain repo (could be empty) and crypt repo should be clean (no untracked files).
 *
 * @param params
 */
export async function decryptGitCommit(params: IDecryptGitCommitParams): Promise<void> {
  const title = 'decryptGitCommit'
  const { context, cryptCommitNode, crypt2plainIdMap } = params
  const {
    //
    catalog,
    cipherBatcher,
    configKeeper,
    cryptPathResolver,
    plainPathResolver,
    reporter,
  } = context
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, reporter }
  const plainCmdCtx: IGitCommandBaseParams = { cwd: plainPathResolver.root, reporter }

  // [crypt] Move the HEAD pointer to the current crypt commit.
  await checkBranch({ ...cryptCmdCtx, commitHash: cryptCommitNode.id })

  // [plain] Move the HEAD pointer to the first parent commit for creating commit or merging.
  const plainParents = cryptCommitNode.parents.map(cid => getPlainCommitId(cid, crypt2plainIdMap))
  if (plainParents.length > 0) {
    await checkBranch({ ...plainCmdCtx, commitHash: plainParents[0] })
  }

  const cipherConfig: IGitCipherConfig = await configKeeper.load()
  invariant(!!cipherConfig, `[${title}] cannot load config. cryptCommitId(${cryptCommitNode.id})`)

  const commitMessage: string = cipherConfig.commit.message
  const cryptSignature: IGitCommitInfo = await showCommitInfo({
    ...cryptCmdCtx,
    commitHash: cryptCommitNode.id,
  })
  const shouldAmend: boolean = plainParents.length > 1
  if (plainParents.length > 1) {
    await mergeCommits({
      ...cryptSignature,
      ...plainCmdCtx,
      message: commitMessage,
      parentIds: plainParents,
      strategy: 'ours',
    })
  }

  const cryptPathMap: Map<string, string[]> = await collect({
    PART_CODE_PREFIX: catalog.context.PART_CODE_PREFIX,
    context,
    cryptCmdCtx,
    cryptCommitNode,
    cryptPathResolver,
  })
  const itemsForDecrypt: ICatalogItem[] = []
  const filesForClean: string[] = []
  for (const deserializedItem of cipherConfig.catalog.items) {
    const item = await catalog.flatItem(deserializedItem)
    if (cryptPathMap.has(item.cryptPath)) {
      itemsForDecrypt.push(item)
      cryptPathMap.delete(item.cryptPath)
      filesForClean.push(item.plainPath)
    }
  }

  // [pain] Clean untracked filepaths to avoid unexpected errors.
  if (cryptPathMap.size > 0) {
    await clean({
      context,
      cryptCmdCtx,
      cryptPathMap,
      filesForClean,
      cryptParentIds: cryptCommitNode.parents,
      plainCmdCtx,
    })
  }

  if (itemsForDecrypt.length > 0) {
    await cipherBatcher.batchDecrypt({
      items: itemsForDecrypt,
      cryptPathResolver,
      plainPathResolver,
    })
  }

  await commitAll({
    ...cryptSignature,
    ...plainCmdCtx,
    message: commitMessage,
    amend: shouldAmend,
  })
}

async function clean(params: {
  readonly context: IGitCipherContext
  readonly cryptCmdCtx: IGitCommandBaseParams
  readonly cryptPathMap: Map<string, string[]>
  readonly cryptParentIds: string[]
  readonly filesForClean: string[]
  readonly plainCmdCtx: IGitCommandBaseParams
}): Promise<void> {
  const { context, cryptCmdCtx, cryptPathMap, cryptParentIds, filesForClean, plainCmdCtx } = params
  const { catalog, catalogConfigPath, configKeeper, cryptPathResolver } = context

  for (const parentId of cryptParentIds) {
    if (cryptPathMap.size <= 0) break

    const catalogContent: string = await showFileContent({
      ...cryptCmdCtx,
      filepath: cryptPathResolver.relative(catalogConfigPath, true),
      commitHash: parentId,
    })
    const cipherConfig: IGitCipherConfig = await configKeeper.parse(catalogContent)
    for (const item of cipherConfig.catalog.items) {
      if (cryptPathMap.size <= 0) break

      const cryptPath: string = await catalog.calcCryptPath(item.plainPath)
      const cryptPathParts: string[] | undefined = cryptPathMap.get(cryptPath)
      if (cryptPathParts !== undefined) {
        cryptPathMap.delete(cryptPath)
        filesForClean.push(item.plainPath)
      }
    }
  }

  if (filesForClean.length > 0) {
    const firstLevelPathForClean: Set<string> = new Set()
    for (const plainPath of filesForClean) {
      const absolutePlainPath: string = context.plainPathResolver.resolve(plainPath)
      if (existsSync(absolutePlainPath)) await fs.unlink(absolutePlainPath)
      const pieces = plainPath.split(/[/\\]/g)
      firstLevelPathForClean.add(pieces[0])
    }
    await cleanUntrackedFilepaths({
      ...plainCmdCtx,
      filepaths: Array.from(firstLevelPathForClean),
    })
  }

  invariant(
    cryptPathMap.size <= 0,
    () =>
      `[clean] Failed to clean untracked files. (${Array.from(cryptPathMap.keys()).join(', ')})`,
  )
}

async function collect(params: {
  readonly PART_CODE_PREFIX: string
  readonly context: IGitCipherContext
  readonly cryptCmdCtx: IGitCommandBaseParams
  readonly cryptCommitNode: IGitCommitDagNode
  readonly cryptPathResolver: IWorkspacePathResolver
}): Promise<Map<string, string[]>> {
  const { PART_CODE_PREFIX, context, cryptCmdCtx, cryptCommitNode, cryptPathResolver } = params
  const cryptPathsWithPart: ReadonlySet<string> | ReadonlyArray<string> =
    await collectChangedCryptPathWithParts()
  const cryptPathMap: Map<string, string[]> = new Map()

  for (const cryptPathWithPart of cryptPathsWithPart) {
    const extname: string = path.extname(cryptPathWithPart)
    const cryptPath: string = extname.startsWith(PART_CODE_PREFIX)
      ? cryptPathWithPart.slice(0, cryptPathWithPart.length - extname.length)
      : cryptPathWithPart
    const parts: string[] = cryptPathMap.get(cryptPath) ?? []
    parts.push(cryptPathWithPart)
    cryptPathMap.set(cryptPath, parts)
  }
  const relativecatalogConfigPath: string = cryptPathResolver.relative(
    context.catalogConfigPath,
    true,
  )
  cryptPathMap.delete(relativecatalogConfigPath)
  return cryptPathMap

  async function collectChangedCryptPathWithParts(): Promise<
    ReadonlySet<string> | ReadonlyArray<string>
  > {
    if (cryptCommitNode.parents.length <= 0) {
      return listAllFiles({ ...cryptCmdCtx, commitHash: cryptCommitNode.id })
    }

    if (cryptCommitNode.parents.length === 1) {
      return listDiffFiles({
        ...cryptCmdCtx,
        olderCommitHash: cryptCommitNode.parents[0],
        newerCommitHash: cryptCommitNode.id,
      })
    }

    const cryptPathWithPartSet: Set<string> = new Set<string>()
    for (const parentId of cryptCommitNode.parents) {
      const cryptPaths: string[] = await listDiffFiles({
        ...cryptCmdCtx,
        olderCommitHash: parentId,
        newerCommitHash: cryptCommitNode.id,
      })
      cryptPaths.forEach(cryptPath => cryptPathWithPartSet.add(cryptPath))
    }
    return cryptPathWithPartSet
  }
}
