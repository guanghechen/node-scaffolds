import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IFileCipherCatalog,
  IFileCipherCatalogDiffItem,
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
import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import type { IGitCipherConfig } from '../types'

export interface IDecryptFilesOnlyParams {
  catalog: IFileCipherCatalog
  cryptCommitId: string
  cipherBatcher: IFileCipherBatcher
  pathResolver: FileCipherPathResolver
  configKeeper: IConfigKeeper<IGitCipherConfig>
  logger?: ILogger
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
    cryptCommitId,
    pathResolver,
    cipherBatcher,
    configKeeper,
    logger,
    getDynamicIv,
  } = params
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.cryptRootDir, logger }

  const getIv = (item: IFileCipherCatalogItemBase): Buffer =>
    getDynamicIv([Buffer.from(item.plainFilepath, 'hex'), Buffer.from(item.fingerprint, 'hex')])

  invariant(
    isGitRepo(pathResolver.cryptRootDir),
    `[decryptFilesOnly] crypt repo is not a git repo. (${pathResolver.cryptRootDir})`,
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
      newItem: {
        ...catalog.flatCatalogItem(item),
        iv: getIv(item).toString('hex'),
        authTag: item.authTag,
      },
    }))
    await cipherBatcher.batchDecrypt({ diffItems, pathResolver, strictCheck: false })
  } finally {
    // Restore crypt repo HEAD point.
    await checkBranch({ ...cryptCmdCtx, branchOrCommitId: initialHeadBranchOrCommitId })
  }
}
