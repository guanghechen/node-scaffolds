import type {
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogDiffItemDraft,
  IFileCipherCatalogItem,
} from '@guanghechen/helper-cipher-file'
import { FileCipherCatalog, collectAffectedCryptFilepaths } from '@guanghechen/helper-cipher-file'
import { collectAllFiles } from '@guanghechen/helper-fs'
import {
  cleanUntrackedFilepaths,
  commitAll,
  hasUncommittedContent,
  isGitRepo,
} from '@guanghechen/helper-git'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import type { IGitCipherContext } from '../GitCipherContext'
import type { IGitCipherConfig } from '../types'
import { generateCommitHash } from '../util'

export interface IEncryptFilesOnlyParams {
  context: IGitCipherContext
  cryptPathResolver: FilepathResolver
  plainPathResolver: FilepathResolver
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
  const { catalogContext, cipherBatcher, configKeeper, logger, getIv } = context
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }

  invariant(isGitRepo(cryptPathResolver.rootDir), `[${title}] crypt repo is not a git repo.`)

  invariant(
    !(await hasUncommittedContent(cryptCmdCtx)),
    `[${title}] crypt repo has uncommitted changes.`,
  )

  const plainFiles: string[] = (await collectAllFiles(plainPathResolver.rootDir)).sort()
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

  logger?.debug(`[${title}] diffItems:`, diffItems)

  // Encrypt files & update config.
  const config: IGitCipherConfig = {
    commit: {
      message,
    },
    catalog: {
      diffItems,
      items: Array.from(catalog.items),
    },
  }
  await configKeeper.update(config)
  await configKeeper.save()

  const cryptMessage: string = generateCommitHash(config.catalog.items)
  await commitAll({ ...cryptCmdCtx, message: cryptMessage, amend: false })
}
