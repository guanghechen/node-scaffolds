import type {
  ICatalogDiffItem,
  ICipherCatalog,
  IDraftCatalogDiffItem,
} from '@guanghechen/cipher-workspace.types'
import { collectAffectedCryptFilepaths } from '@guanghechen/helper-cipher-file'
import { cleanUntrackedFilepaths, commitAll } from '@guanghechen/helper-git'
import type { IGitCommandBaseParams, IGitCommitInfo } from '@guanghechen/helper-git'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import type { IGitCipherContext } from '../GitCipherContext'
import type { IGitCipherConfig } from '../types'
import { generateCommitHash } from '../util'

export interface IInternalEncryptDiffItemsParams {
  catalog: ICipherCatalog
  context: IGitCipherContext
  cryptPathResolver: IWorkspacePathResolver
  draftDiffItems: IDraftCatalogDiffItem[]
  plainPathResolver: IWorkspacePathResolver
  shouldAmend: boolean
  signature: Partial<IGitCommitInfo> & Pick<IGitCommitInfo, 'message'>
}

/**
 * !!!Notice: check if there are some un-staged files before call this func.
 */
export async function internalEncryptDiffItems(
  params: IInternalEncryptDiffItemsParams,
): Promise<void> {
  const {
    catalog,
    context,
    cryptPathResolver,
    draftDiffItems,
    plainPathResolver,
    shouldAmend,
    signature,
  } = params
  const { cipherBatcher, configKeeper, reporter, getIv } = context
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, reporter }

  // [crypt] Clean untracked filepaths to avoid unexpected errors.
  const cryptFiles: string[] = collectAffectedCryptFilepaths(draftDiffItems)
  await cleanUntrackedFilepaths({ ...cryptCmdCtx, filepaths: cryptFiles })

  // Update catalog.
  const diffItems: ICatalogDiffItem[] = await cipherBatcher.batchEncrypt({
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
