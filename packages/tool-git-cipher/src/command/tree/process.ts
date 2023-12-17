import type { ICipherFactory } from '@guanghechen/cipher'
import type { ICatalogItem } from '@guanghechen/cipher-catalog'
import {
  FileTree,
  FileTreeNodeTypeEnum,
  caseSensitiveCmp,
  isFileTreeOperationFailed,
  splitPathFromRoot,
} from '@guanghechen/filetree'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isGitRepo, showFileContent } from '@guanghechen/helper-git'
import { GitCipherConfigKeeper } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'node:fs'
import { loadGitCipherContext } from '../../shared/util/context/loadGitCipherContext'
import type { IGitCipherSubCommandProcessor } from '../_base'
import { GitCipherSubCommandProcessor } from '../_base'
import type { IGitCipherTreeContext } from './context'
import type { IGitCipherTreeOptions } from './option'

type O = IGitCipherTreeOptions
type C = IGitCipherTreeContext

const clazz = 'GitCipherTree'

export class GitCipherTree
  extends GitCipherSubCommandProcessor<O, C>
  implements IGitCipherSubCommandProcessor<O, C>
{
  public override async process(): Promise<void> {
    const title = `${clazz}.process`
    const { context, secretMaster, reporter } = this
    const { cryptPathResolver, plainPathResolver } = context

    invariant(hasGitInstalled(), `[${title}] Cannot find git, have you installed it?`)

    invariant(
      existsSync(cryptPathResolver.root),
      `[${title}] Cannot find cryptRootDir. ${cryptPathResolver.root}`,
    )

    invariant(
      isGitRepo(cryptPathResolver.root),
      `[${title}] cryptRootDir is not a git repo. ${cryptPathResolver.root}`,
    )

    const secretKeeper = await secretMaster.load({
      filepath: context.secretFilepath,
      cryptRootDir: cryptPathResolver.root,
      force: false,
    })

    const cipherFactory: ICipherFactory | undefined = secretMaster.cipherFactory
    invariant(
      !!secretKeeper.data && !!cipherFactory && !!secretMaster.catalogCipher,
      `[${title}] Secret cipherFactory is not available!`,
    )

    const { catalogFilepath } = secretKeeper.data
    const catalogContent: string = await showFileContent({
      filepath: cryptPathResolver.relative(catalogFilepath),
      commitHash: context.cryptCommitId,
      cwd: cryptPathResolver.root,
      reporter,
    })

    const configKeeper = new GitCipherConfigKeeper({
      cipher: secretMaster.catalogCipher,
      resource: {
        load: async () => catalogContent,
        save: async () => {},
        destroy: async () => {},
        exists: async () => true,
      },
    })
    await configKeeper.load()

    const gitCipherContext = await loadGitCipherContext({
      secretFilepath: context.secretFilepath,
      secretMaster: this.secretMaster,
      cryptPathResolver,
      plainPathResolver,
      reporter,
    })
    const { catalog } = gitCipherContext
    const items: ICatalogItem[] = await Promise.all<ICatalogItem>(
      configKeeper.data?.catalog.items.map(async (item): Promise<ICatalogItem> => {
        const iii = await catalog.flatItem(item)
        return iii
      }) ?? [],
    )

    const filetree = FileTree.fromRawNodes(
      items.map(item => ({
        type: FileTreeNodeTypeEnum.FILE,
        pathFromRoot: splitPathFromRoot(item.plainFilepath),
        ctime: item.ctime,
        mtime: item.mtime,
        size: item.size,
      })),
      caseSensitiveCmp,
    )
    if (isFileTreeOperationFailed(filetree)) {
      throw new Error(`Failed to build filetree. ERROR CODE: ${filetree}.`)
    }

    const lines: string[] = filetree.draw()
    console.log(lines.join('\n'))
  }
}
