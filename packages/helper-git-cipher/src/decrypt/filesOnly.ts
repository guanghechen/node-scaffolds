import { FileChangeType } from '@guanghechen/cipher-catalog'
import type { ICatalogDiffItem, IDeserializedCatalogItem } from '@guanghechen/cipher-catalog'
import {
  checkBranch,
  getHeadBranchOrCommitId,
  hasUncommittedContent,
  isGitRepo,
} from '@guanghechen/helper-git'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import invariant from '@guanghechen/invariant'
import type { IGitCipherContext } from '../types'

export interface IDecryptFilesOnlyParams {
  context: IGitCipherContext
  cryptCommitId: string
  filesOnly: string[] | undefined // If empty or undefined, then decrypt all files.
}

/**
 * Decrypt files at the given commit id.
 */
export async function decryptFilesOnly(params: IDecryptFilesOnlyParams): Promise<void> {
  const title = 'decryptFilesOnly'
  const { context, cryptCommitId, filesOnly = [] } = params
  const { catalog, cipherBatcher, configKeeper, reporter } = context
  const { cryptPathResolver, plainPathResolver } = catalog.context

  const cryptCmdCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.root, reporter }

  invariant(
    isGitRepo(cryptPathResolver.root),
    `[${title}] crypt repo is not a git repo. (${cryptPathResolver.root})`,
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

    let preparedItems: IDeserializedCatalogItem[] = configData.catalog.items
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
    const diffItems: ICatalogDiffItem[] = await Promise.all(
      preparedItems.map(
        async (item): Promise<ICatalogDiffItem> => ({
          changeType: FileChangeType.ADDED,
          newItem: await context.catalog.flatItem(item),
        }),
      ),
    )
    await cipherBatcher.batchDecrypt({ catalog, diffItems, strictCheck: false })
  } finally {
    // Restore crypt repo HEAD point.
    await checkBranch({ ...cryptCmdCtx, commitHash: initialCommitHash })
  }
}
