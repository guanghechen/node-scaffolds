import type { IFileCipherCatalogDiffItem } from '@guanghechen/helper-cipher-file'
import { FileChangeType } from '@guanghechen/helper-cipher-file'
import {
  checkBranch,
  getHeadBranchOrCommitId,
  hasUncommittedContent,
  isGitRepo,
} from '@guanghechen/helper-git'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import type { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import type { IGitCipherContext } from '../GitCipherContext'
import type { IFileCipherCatalogItemInstance } from '../types'

export interface IDecryptFilesOnlyParams {
  context: IGitCipherContext
  cryptCommitId: string
  cryptPathResolver: FilepathResolver
  filesOnly: string[] | undefined // If empty or undefined, then decrypt all files.
  plainPathResolver: FilepathResolver
}

/**
 * Decrypt files at the given commit id.
 */
export async function decryptFilesOnly(params: IDecryptFilesOnlyParams): Promise<void> {
  const title = 'decryptFilesOnly'
  const { context, cryptCommitId, cryptPathResolver, filesOnly = [], plainPathResolver } = params
  const { cipherBatcher, configKeeper, logger } = context
  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }

  invariant(
    isGitRepo(cryptPathResolver.rootDir),
    `[${title}] crypt repo is not a git repo. (${cryptPathResolver.rootDir})`,
  )

  invariant(
    !(await hasUncommittedContent(cryptCmdCtx)),
    `[${title}] crypt repo has uncommitted contents.`,
  )

  const initialCommitHash: string = await getHeadBranchOrCommitId(cryptCmdCtx)
  try {
    // [crypt] Move the HEAD pointer to the current decrypting commit.
    await checkBranch({ ...cryptCmdCtx, commitHash: cryptCommitId })

    // Load the diffItems between the <first parent>...<current>.
    await configKeeper.load()
    const configData = configKeeper.data
    invariant(!!configData, `[${title}] cannot load config. cryptCommitId(${cryptCommitId})`)

    let preparedItems: IFileCipherCatalogItemInstance[] = configData.catalog.items
    if (filesOnly.length > 0) {
      const plainFilepathSet: Set<string> = new Set<string>(
        filesOnly.map(f => plainPathResolver.relative(f)),
      )
      preparedItems = preparedItems.filter(item => plainFilepathSet.has(item.plainFilepath))
      if (preparedItems.length !== plainFilepathSet.size) {
        const notFound: string[] = Array.from(plainFilepathSet).filter(
          f => !preparedItems.some(item => item.plainFilepath === f),
        )
        invariant(notFound.length === 0, `[${title}] cannot find file(s): ${notFound.join(', ')}`)
      }
    }

    // Decrypt files.
    const diffItems: IFileCipherCatalogDiffItem[] = preparedItems.map(item => ({
      changeType: FileChangeType.ADDED,
      newItem: context.flatItem(item),
    }))
    await cipherBatcher.batchDecrypt({
      strictCheck: false,
      plainPathResolver,
      cryptPathResolver,
      diffItems,
    })
  } finally {
    // Restore crypt repo HEAD point.
    await checkBranch({ ...cryptCmdCtx, commitHash: initialCommitHash })
  }
}
