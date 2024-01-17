import type {
  ICatalogItem,
  IDraftCatalogDiffItem,
  IDraftCatalogItem,
} from '@guanghechen/cipher-catalog'
import { FileChangeTypeEnum, collectAffectedCryptPaths } from '@guanghechen/cipher-catalog'
import { cleanUntrackedFilepaths, commitAll } from '@guanghechen/helper-git'
import type { IGitCommandBaseParams, IGitCommitInfo } from '@guanghechen/helper-git'
import type { IGitCipherConfig, IGitCipherContext } from '../types'
import { generateCommitHash } from '../util'

export interface IInternalEncryptDiffItemsParams {
  context: IGitCipherContext
  draftDiffItems: IDraftCatalogDiffItem[]
  shouldAmend: boolean
  signature: Partial<IGitCommitInfo> & Pick<IGitCommitInfo, 'message'>
}

/**
 * !!!Notice: check if there are some un-staged files before call this func.
 */
export async function internalEncryptDiffItems(
  params: IInternalEncryptDiffItemsParams,
): Promise<void> {
  const { context, draftDiffItems, shouldAmend, signature } = params
  const { catalog, cipherBatcher, configKeeper, cryptPathResolver, plainPathResolver, reporter } =
    context
  const cwd: string = cryptPathResolver.root
  const cryptCmdCtx: IGitCommandBaseParams = { cwd, reporter }

  // [crypt] Clean untracked filepaths to avoid unexpected errors.
  const cryptFiles: string[] = collectAffectedCryptPaths(draftDiffItems)
  await cleanUntrackedFilepaths({ ...cryptCmdCtx, filepaths: cryptFiles })

  // Update catalog.
  const items: ICatalogItem[] = await cipherBatcher.batchEncryptByDiffItems({
    cryptPathResolver,
    diffItems: draftDiffItems,
    plainPathResolver,
  })

  for (const draftDiffItem of draftDiffItems) {
    switch (draftDiffItem.changeType) {
      case FileChangeTypeEnum.ADDED: {
        const draftItem: IDraftCatalogItem = draftDiffItem.newItem
        const item = items.find(item => item.plainPath === draftItem.plainPath)
        if (item) catalog.insertOrUpdate(item)
        break
      }
      case FileChangeTypeEnum.MODIFIED: {
        const oldDraftItem: IDraftCatalogItem = draftDiffItem.oldItem
        const newDraftItem: IDraftCatalogItem = draftDiffItem.newItem
        const item = items.find(item => item.plainPath === newDraftItem.plainPath)

        if (item) catalog.insertOrUpdate(item)
        if (oldDraftItem.plainPath !== newDraftItem.plainPath) {
          catalog.remove(oldDraftItem.plainPath)
        }
        break
      }
      case FileChangeTypeEnum.REMOVED: {
        const oldDraftItem: IDraftCatalogItem = draftDiffItem.oldItem
        catalog.remove(oldDraftItem.plainPath)
        break
      }
      /* c8 ignore start */
      default:
        throw new TypeError(`unexpected changeType. ${draftDiffItem['changeType']}`)
      /* c8 ignore stop */
    }
  }

  // Encrypt files & update config.
  const config: IGitCipherConfig = {
    commit: {
      message: signature.message,
    },
    catalog: {
      items: Array.from(catalog.items),
    },
  }
  await configKeeper.update(config)
  await configKeeper.save()

  const cryptMessage: string = generateCommitHash(config.catalog.items)
  await commitAll({ ...cryptCmdCtx, ...signature, message: cryptMessage, amend: shouldAmend })
}
