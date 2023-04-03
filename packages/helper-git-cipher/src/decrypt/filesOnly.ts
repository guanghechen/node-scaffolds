import type {
  IFileCipherBatcher,
  IFileCipherCatalogContext,
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogItem,
  IFileCipherCatalogItemBase,
} from '@guanghechen/helper-cipher-file'
import { FileChangeType, calcCryptFilepath } from '@guanghechen/helper-cipher-file'
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
  catalogContext: IFileCipherCatalogContext
  cipherBatcher: IFileCipherBatcher
  configKeeper: IConfigKeeper<IGitCipherConfig>
  cryptCommitId: string
  cryptPathResolver: FilepathResolver
  filesOnly: string[] | undefined // If empty or undefined, then decrypt all files.
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
    catalogContext,
    cipherBatcher,
    configKeeper,
    cryptCommitId,
    cryptPathResolver,
    filesOnly = [],
    logger,
    plainPathResolver,
    getDynamicIv,
  } = params
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }

  const getIv = (item: IFileCipherCatalogItemBase): Buffer =>
    getDynamicIv([Buffer.from(item.plainFilepath, 'utf8'), Buffer.from(item.fingerprint, 'hex')])
  const flatItem = (item: IFileCipherCatalogItemInstance): IFileCipherCatalogItem => ({
    ...item,
    cryptFilepath: calcCryptFilepath(item.plainFilepath, catalogContext),
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
    await checkBranch({ ...cryptCmdCtx, commitHash: cryptCommitId })

    // Load the diffItems between the <first parent>...<current>.
    await configKeeper.load()
    const configData = configKeeper.data
    invariant(
      !!configData,
      `[decryptFilesOnly] cannot load config. encryptedCommitId(${cryptCommitId})`,
    )

    let preparedItems: IFileCipherCatalogItemInstance[] = configData.catalog.items
    if (filesOnly.length > 0) {
      const plainFilepathSet: Set<string> = new Set<string>(
        filesOnly.map(f => plainPathResolver.relative(f)),
      )
      preparedItems = preparedItems.filter(item => plainFilepathSet.has(item.plainFilepath))
      if (preparedItems.length !== plainFilepathSet.size) {
        const notFoundFilepaths: string[] = Array.from(plainFilepathSet).filter(
          f => !preparedItems.some(item => item.plainFilepath === f),
        )
        invariant(
          notFoundFilepaths.length === 0,
          `[decryptFilesOnly] cannot find file(s): ${notFoundFilepaths.join(', ')}`,
        )
      }
    }

    // Decrypt files.
    const diffItems: IFileCipherCatalogDiffItem[] = preparedItems.map(item => ({
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
    await checkBranch({ ...cryptCmdCtx, commitHash: initialHeadBranchOrCommitId })
  }
}
