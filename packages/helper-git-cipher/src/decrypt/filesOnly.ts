import type {
  IFileCipherBatcher,
  IFileCipherCatalog,
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogItem,
  IFileCipherCatalogItemBase,
} from '@guanghechen/helper-cipher-file'
import { FileChangeType } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import {
  checkBranch,
  getHeadBranchOrCommitId,
  hasUncommittedContent,
  isGitRepo,
} from '@guanghechen/helper-git'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IFileCipherCatalogItemInstance, IGitCipherConfig } from '../types'

export interface IDecryptFilesOnlyParams {
  catalog: IFileCipherCatalog
  cipherBatcher: IFileCipherBatcher
  configKeeper: IConfigKeeper<IGitCipherConfig>
  cryptCommitId: string
  cryptPathResolver: FilepathResolver
  logger: ILogger | undefined
  plainPathResolver: FilepathResolver
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
}

/**
 * Decrypt files at the given commit id.
 *
 * @param params
 */
export async function decryptFilesOnly(params: IDecryptFilesOnlyParams): Promise<void> {
  const {
    catalog,
    cipherBatcher,
    configKeeper,
    cryptCommitId,
    cryptPathResolver,
    logger,
    plainPathResolver,
    getDynamicIv,
  } = params
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }

  const getIv = (item: IFileCipherCatalogItemBase): Buffer =>
    getDynamicIv([Buffer.from(item.plainFilepath, 'hex'), Buffer.from(item.fingerprint, 'hex')])
  const flatItem = (item: IFileCipherCatalogItemInstance): IFileCipherCatalogItem => ({
    ...catalog.flatCatalogItem(item),
    iv: getIv(item),
    authTag: item.authTag,
  })

  invariant(
    isGitRepo(cryptPathResolver.rootDir),
    `[decryptFilesOnly] crypt repo is not a git repo. (${cryptPathResolver.rootDir})`,
  )

  invariant(
    !(await hasUncommittedContent(cryptCmdCtx)),
    '[decryptFilesOnly] crypt repo has uncommitted contents.',
  )

  const initialHeadBranchOrCommitId: string = await getHeadBranchOrCommitId(cryptCmdCtx)
  try {
    // [crypt] Move the HEAD pointer to the current decrypting commit.
    await checkBranch({ ...cryptCmdCtx, branchOrCommitId: cryptCommitId })

    // Load the diffItems between the <first parent>...<current>.
    await configKeeper.load()
    const configData = configKeeper.data
    invariant(
      !!configData,
      `[decryptFilesOnly] cannot load config. filepath(${configKeeper.filepath}), encryptedCommitId(${cryptCommitId})`,
    )

    // Decrypt files.
    const diffItems: IFileCipherCatalogDiffItem[] = configData.catalog.items.map(item => ({
      changeType: FileChangeType.ADDED,
      newItem: flatItem(item),
    }))
    await cipherBatcher.batchDecrypt({
      strictCheck: false,
      plainPathResolver,
      cryptPathResolver,
      diffItems,
    })
  } finally {
    // Restore crypt repo HEAD point.
    await checkBranch({ ...cryptCmdCtx, branchOrCommitId: initialHeadBranchOrCommitId })
  }
}
