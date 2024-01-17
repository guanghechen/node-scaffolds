import type { ICatalogItem, IDraftCatalogDiffItem } from '@guanghechen/cipher-catalog'
import { collectAllFiles } from '@guanghechen/helper-fs'
import { hasUncommittedContent, isGitRepo } from '@guanghechen/helper-git'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { IReporter } from '@guanghechen/reporter.types'
import type { IGitCipherConfig, IGitCipherContext } from '../types'
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
  const { catalog, configKeeper, cryptPathResolver, plainPathResolver, reporter } = context
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, reporter }

  invariant(isGitRepo(cryptPathResolver.root), `[${title}] crypt repo is not a git repo.`)

  invariant(
    !(await hasUncommittedContent(cryptCmdCtx)),
    `[${title}] crypt repo has uncommitted changes.`,
  )

  const plainPaths: string[] = (await collectAllFiles(plainPathResolver.root)).map(filepath =>
    plainPathResolver.relative(filepath, true),
  )
  if (plainPaths.length <= 0) {
    reporter?.info(`[${title}] No files to commit.`)
    return
  }

  const cipherConfig: IGitCipherConfig = await configKeeper.load()
  invariant(!!cipherConfig, `[${title}] cannot load config.`)

  const items: ICatalogItem[] = await Promise.all(
    cipherConfig.catalog.items.map(
      async (item): Promise<ICatalogItem> => context.catalog.flatItem(item),
    ),
  )
  catalog.reset(items)
  const candidateDraftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
    plainPaths,
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
