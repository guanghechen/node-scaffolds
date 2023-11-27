import type { ICipherFactory } from '@guanghechen/cipher'
import type { IFileTree } from '@guanghechen/filetree'
import { FileTree, FileTreeNodeTypeEnum } from '@guanghechen/filetree'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isGitRepo, showFileContent } from '@guanghechen/helper-git'
import { GitCipherConfigKeeper } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'node:fs'
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
    const { cryptPathResolver } = context

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

    const filepaths: string[] =
      configKeeper.data?.catalog.items.map(item => item.plainFilepath) ?? []
    const filetree: IFileTree = FileTree.build(
      filepaths.map(filepath => ({
        type: FileTreeNodeTypeEnum.FILE,
        paths: filepath.split(/[/\\]/g).filter(x => !!x),
      })),
      (x, y) => x.localeCompare(y),
    )
    filetree.print()
  }
}
