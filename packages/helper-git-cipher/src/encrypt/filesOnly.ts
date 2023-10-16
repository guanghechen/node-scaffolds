import type {
  IFileCipherCatalogDiffItemDraft,
  IFileCipherCatalogItem,
} from '@guanghechen/helper-cipher-file'
import { FileCipherCatalog } from '@guanghechen/helper-cipher-file'
import { collectAllFiles } from '@guanghechen/helper-fs'
import { hasUncommittedContent, isGitRepo } from '@guanghechen/helper-git'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import type { IGitCipherContext } from '../GitCipherContext'
import { internalEncryptDiffItems } from './_internal'

export interface IEncryptFilesOnlyParams {
  context: IGitCipherContext
  cryptPathResolver: IWorkspacePathResolver
  plainPathResolver: IWorkspacePathResolver
  confirm(
    candidateDiffItems: ReadonlyArray<IFileCipherCatalogDiffItemDraft>,
  ): Promise<{ diffItems: IFileCipherCatalogDiffItemDraft[]; message: string }>
}

/**
 * Encrypt files at the given commit id.
 */
export async function encryptFilesOnly(params: IEncryptFilesOnlyParams): Promise<void> {
  const title = 'encryptFilesOnly'
  const { context, cryptPathResolver, plainPathResolver, confirm } = params
  const { catalogContext, configKeeper, logger } = context
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, logger }

  invariant(isGitRepo(cryptPathResolver.root), `[${title}] crypt repo is not a git repo.`)

  invariant(
    !(await hasUncommittedContent(cryptCmdCtx)),
    `[${title}] crypt repo has uncommitted changes.`,
  )

  const plainFiles: string[] = (await collectAllFiles(plainPathResolver.root)).sort()
  if (plainFiles.length <= 0) {
    logger?.info(`[${title}] No files to commit.`)
    return
  }

  await configKeeper.load()
  const configData = configKeeper.data
  invariant(!!configData, `[${title}] cannot load config.`)

  const items: IFileCipherCatalogItem[] = configData.catalog.items.map(item =>
    context.flatItem(item),
  )
  const catalog = new FileCipherCatalog({
    context: catalogContext,
    cryptPathResolver,
    plainPathResolver,
  })
  catalog.reset(items)

  const candidateDraftDiffItems: IFileCipherCatalogDiffItemDraft[] =
    await catalog.diffFromPlainFiles({ plainFilepaths: plainFiles.sort(), strickCheck: false })
  const confirmResult = await confirm(candidateDraftDiffItems)
  const draftDiffItems = confirmResult.diffItems
  const message = confirmResult.message.trim()

  if (draftDiffItems.length <= 0) {
    logger?.info(`[${title}] No files to commit.`)
    return
  }

  if (!message) {
    logger?.error(`[${title}] bad git commit message. (abort)`)
    return
  }

  await internalEncryptDiffItems({
    catalog,
    context,
    cryptPathResolver,
    draftDiffItems,
    plainPathResolver,
    shouldAmend: false,
    signature: {
      message,
    },
  })
}
