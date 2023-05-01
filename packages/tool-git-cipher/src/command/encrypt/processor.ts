import type {
  IFileCipherCatalogDiffItemDraft,
  IFileCipherCatalogItemDraft,
} from '@guanghechen/helper-cipher-file'
import { FileChangeType } from '@guanghechen/helper-cipher-file'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { GitCipher, encryptFilesOnly } from '@guanghechen/helper-git-cipher'
import { isNonBlankString } from '@guanghechen/helper-is'
import { FilepathResolver } from '@guanghechen/helper-path'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import inquirer from 'inquirer'
import { logger } from '../../core/logger'
import type { ICatalogCache } from '../../util/CatalogCache'
import { CatalogCacheKeeper } from '../../util/CatalogCache'
import { loadGitCipherContext } from '../../util/context/loadGitCipherContext'
import { SecretMaster } from '../../util/SecretMaster'
import type { IGitCipherEncryptContext } from './context'

export class GitCipherEncryptProcessor {
  protected readonly context: IGitCipherEncryptContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherEncryptContext) {
    logger.debug('context:', context)

    this.context = context
    this.secretMaster = new SecretMaster({
      showAsterisk: context.showAsterisk,
      maxRetryTimes: context.maxRetryTimes,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async encrypt(): Promise<void> {
    const title = 'processor.encrypt'
    invariant(hasGitInstalled(), `[${title}] Cannot find git, have you installed it?`)

    const { context } = this
    const { context: gitCipherContext } = await loadGitCipherContext({
      cryptRootDir: context.cryptRootDir,
      secretFilepath: context.secretFilepath,
      secretMaster: this.secretMaster,
    })
    const gitCipher = new GitCipher({ context: gitCipherContext })

    const plainPathResolver = new FilepathResolver(context.plainRootDir)
    const cryptPathResolver = new FilepathResolver(context.cryptRootDir)

    if (context.filesOnly) {
      await encryptFilesOnly({
        context: gitCipherContext,
        cryptPathResolver,
        plainPathResolver,
        confirm: pickDiffItems,
      })
    } else {
      // encrypt files
      const cacheKeeper = new CatalogCacheKeeper({
        storage: new FileStorage({
          strict: true,
          filepath: context.catalogCacheFilepath,
          encoding: 'utf8',
        }),
      })
      await cacheKeeper.load()
      const data: ICatalogCache = cacheKeeper.data ?? { crypt2plainIdMap: new Map() }
      const { crypt2plainIdMap } = await gitCipher.encrypt({
        cryptPathResolver,
        crypt2plainIdMap: new Map(data.crypt2plainIdMap),
        plainPathResolver,
      })
      await cacheKeeper.update({ crypt2plainIdMap })
      await cacheKeeper.save()
    }
  }
}

async function pickDiffItems(
  candidateDiffItems: ReadonlyArray<IFileCipherCatalogDiffItemDraft>,
): Promise<{ diffItems: IFileCipherCatalogDiffItemDraft[]; message: string }> {
  const added: Array<{ index: number; newItem: IFileCipherCatalogItemDraft }> = []
  const removed: Array<{ index: number; oldItem: IFileCipherCatalogItemDraft }> = []
  const modified: Array<{
    index: number
    oldItem: IFileCipherCatalogItemDraft
    newItem: IFileCipherCatalogItemDraft
  }> = []

  for (let i = 0; i < candidateDiffItems.length; ++i) {
    const diffItem = candidateDiffItems[i]
    switch (diffItem.changeType) {
      case FileChangeType.ADDED:
        added.push({ index: i, newItem: diffItem.newItem })
        break
      case FileChangeType.REMOVED:
        removed.push({ index: i, oldItem: diffItem.oldItem })
        break
      case FileChangeType.MODIFIED:
        modified.push({ index: i, oldItem: diffItem.oldItem, newItem: diffItem.newItem })
        break
    }
  }

  interface IAnswers {
    removed: number[] | undefined
    added: number[] | undefined
    modified: number[] | undefined
    message: string | undefined
  }

  const answers: IAnswers = await inquirer.prompt<IAnswers>(
    [
      removed.length > 0 && {
        type: 'checkbox',
        name: 'removed',
        message: 'Select files to commit (removed)',
        choices: removed.map(({ index, oldItem }) => ({
          name: oldItem.plainFilepath,
          value: index,
        })),
      },
      added.length > 0 && {
        type: 'checkbox',
        name: 'added',
        message: 'Select files to commit (added)',
        choices: added.map(({ index, newItem }) => ({
          name: newItem.plainFilepath,
          value: index,
        })),
      },
      modified.length > 0 && {
        type: 'checkbox',
        name: 'modified',
        message: 'Select files to commit (modified)',
        choices: modified.map(({ index, oldItem, newItem }) => ({
          name:
            oldItem.plainFilepath === newItem.plainFilepath
              ? oldItem.plainFilepath
              : `${oldItem.plainFilepath} --> ${newItem.plainFilepath}`,
          value: index,
        })),
      },
      {
        type: 'input',
        name: 'message',
        message: 'Commit message',
        transformer: (value: string): string => value.trim(),
        validate: (value: string) => {
          if (isNonBlankString(value.trim())) return true
          return 'Please input a non-blank string!'
        },
        when: (answer: IAnswers): boolean =>
          !!answer.removed?.length || !!answer.added?.length || !!answer.modified?.length,
      },
    ].filter(Boolean),
  )
  logger.debug('answers:', answers)

  const idSet: Set<number> = new Set<number>([
    ...(answers.added ?? []),
    ...(answers.removed ?? []),
    ...(answers.modified ?? []),
  ])
  const diffItems = candidateDiffItems.filter((_, i) => idSet.has(i))
  return {
    diffItems,
    message: (answers.message ?? '').trim(),
  }
}
