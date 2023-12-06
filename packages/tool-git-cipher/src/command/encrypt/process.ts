import type { IDraftCatalogDiffItem, IDraftCatalogItem } from '@guanghechen/cipher-catalog'
import { FileChangeType } from '@guanghechen/cipher-catalog'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { GitCipher, encryptFilesOnly } from '@guanghechen/helper-git-cipher'
import { isNonBlankString } from '@guanghechen/helper-is'
import invariant from '@guanghechen/invariant'
import type { IReporter } from '@guanghechen/reporter.types'
import { TextFileResource } from '@guanghechen/resource'
import type { ICatalogCache } from '../../shared/CatalogCache'
import { CatalogCacheKeeper } from '../../shared/CatalogCache'
import { loadGitCipherContext } from '../../shared/util/context/loadGitCipherContext'
import type { IGitCipherSubCommandProcessor } from '../_base'
import { GitCipherSubCommandProcessor } from '../_base'
import type { IGitCipherEncryptContext } from './context'
import type { IGitCipherEncryptOptions } from './option'

type O = IGitCipherEncryptOptions
type C = IGitCipherEncryptContext

const clazz = 'GitCipherEncrypt'

export class GitCipherEncrypt
  extends GitCipherSubCommandProcessor<O, C>
  implements IGitCipherSubCommandProcessor<O, C>
{
  public override async process(): Promise<void> {
    const title = `${clazz}.process`
    invariant(hasGitInstalled(), `[${title}] Cannot find git, have you installed it?`)

    const { context, reporter } = this
    const { cryptPathResolver, plainPathResolver } = context
    const { context: gitCipherContext } = await loadGitCipherContext({
      secretFilepath: context.secretFilepath,
      secretMaster: this.secretMaster,
      cryptPathResolver,
      plainPathResolver,
      reporter,
    })
    const gitCipher = new GitCipher({ context: gitCipherContext })

    if (context.filesOnly) {
      await encryptFilesOnly({ context: gitCipherContext, confirm: pickDiffItems })
    } else {
      // encrypt files
      const cacheKeeper = new CatalogCacheKeeper({
        resource: new TextFileResource({
          strict: true,
          filepath: context.catalogCacheFilepath,
          encoding: 'utf8',
        }),
        reporter,
      })
      await cacheKeeper.load()
      const data: ICatalogCache = cacheKeeper.data ?? { crypt2plainIdMap: new Map() }
      const { crypt2plainIdMap } = await gitCipher.encrypt({
        crypt2plainIdMap: new Map(data.crypt2plainIdMap),
      })
      await cacheKeeper.update({ crypt2plainIdMap })
      await cacheKeeper.save()
    }
  }
}

async function pickDiffItems(
  candidateDiffItems: ReadonlyArray<IDraftCatalogDiffItem>,
  reporter: IReporter,
): Promise<{ diffItems: IDraftCatalogDiffItem[]; message: string }> {
  const added: Array<{ index: number; newItem: IDraftCatalogItem }> = []
  const removed: Array<{ index: number; oldItem: IDraftCatalogItem }> = []
  const modified: Array<{
    index: number
    oldItem: IDraftCatalogItem
    newItem: IDraftCatalogItem
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

  const inquirer = await import('inquirer').then(md => md.default)
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
  reporter.debug('answers:', answers)

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
