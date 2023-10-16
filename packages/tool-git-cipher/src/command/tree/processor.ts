import type { ICipherFactory } from '@guanghechen/cipher'
import type { IFileTree } from '@guanghechen/filetree'
import { FileTree, FileTreeNodeTypeEnum } from '@guanghechen/filetree'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isGitRepo, showFileContent } from '@guanghechen/helper-git'
import { GitCipherConfigKeeper } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'node:fs'
import { logger } from '../../core/logger'
import { SecretMaster } from '../../util/SecretMaster'
import type { IGitCipherTreeContext } from './context'

export class GitCipherTreeProcessor {
  protected readonly context: IGitCipherTreeContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherTreeContext) {
    logger.debug('context:', context)

    this.context = context
    this.secretMaster = new SecretMaster({
      showAsterisk: context.showAsterisk,
      maxRetryTimes: context.maxRetryTimes,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async tree(): Promise<void> {
    const title = 'processor.tree'
    const { context, secretMaster } = this
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
      logger,
    })

    const configKeeper = new GitCipherConfigKeeper({
      cipher: secretMaster.catalogCipher,
      storage: {
        load: async () => catalogContent,
        save: async () => {},
        remove: async () => {},
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
