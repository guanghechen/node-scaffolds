import type { ICatalogItem, IDraftCatalogDiffItem } from '@guanghechen/cipher-workspace.types'
import { collectAllFiles } from '@guanghechen/helper-fs'
import { hasUncommittedContent, isGitRepo } from '@guanghechen/helper-git'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { IReporter } from '@guanghechen/reporter.types'
import type { IGitCipherContext } from '../types'
import { internalEncryptDiffItems } from './_internal'

export interface IEncryptFilesOnlyParams {
  context: IGitCipherContext
  confirm(
    candidateDiffItems: ReadonlyArray<IDraftCatalogDiffItem>,
    reporter: IReporter,
  ): Promise<{ diffItems: IDraftCatalogDiffItem[]; message: string }>
}

/**
 * Encrypt files at the given commit id.
 */
export async function encryptFilesOnly(params: IEncryptFilesOnlyParams): Promise<void> {
  const title = 'encryptFilesOnly'
  const { context, confirm } = params
  const { catalog, configKeeper, reporter } = context
  const { cryptPathResolver, plainPathResolver } = catalog.context
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, reporter }

  invariant(isGitRepo(cryptPathResolver.root), `[${title}] crypt repo is not a git repo.`)

  invariant(
    !(await hasUncommittedContent(cryptCmdCtx)),
    `[${title}] crypt repo has uncommitted changes.`,
  )

  const plainFiles: string[] = (await collectAllFiles(plainPathResolver.root)).sort()
  if (plainFiles.length <= 0) {
    reporter?.info(`[${title}] No files to commit.`)
    return
  }

  await configKeeper.load()
  const configData = configKeeper.data
  invariant(!!configData, `[${title}] cannot load config.`)

  const items: ICatalogItem[] = await Promise.all(
    configData.catalog.items.map(
      async (item): Promise<ICatalogItem> => context.catalog.flatItem(item),
    ),
  )
  catalog.reset(items)
  const candidateDraftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
    plainFiles.sort(),
    false,
  )
  const confirmResult = await confirm(candidateDraftDiffItems, reporter)
  const draftDiffItems = confirmResult.diffItems
  const message = confirmResult.message.trim()

  if (draftDiffItems.length <= 0) {
    reporter?.info(`[${title}] No files to commit.`)
    return
  }

  if (!message) {
    reporter?.error(`[${title}] bad git commit message. (abort)`)
    return
  }

  await internalEncryptDiffItems({
    context,
    draftDiffItems,
    shouldAmend: false,
    signature: {
      message,
    },
  })
}
