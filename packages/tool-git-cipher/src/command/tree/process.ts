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
import type { IGitCipherConfig } from '@guanghechen/helper-git-cipher'
import { GitCipherConfigKeeper } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import { MemoTextResource } from '@guanghechen/resource'
import { existsSync } from 'node:fs'
import type { ISecretConfig } from '../../shared/SecretConfig.types'
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

    const gitCipherContext = await loadGitCipherContext({
      secretConfigPath: context.secretConfigPath,
      secretMaster: this.secretMaster,
      cryptPathResolver,
      plainPathResolver,
      reporter,
    })
    const { catalog, catalogConfigPath } = gitCipherContext
    const catalogCipherFactory: ICipherFactory | undefined = secretMaster.catalogCipherFactory
    invariant(!!catalogCipherFactory, `[${title}] Missing catalogCipherFactory.`)

    const catalogContent: string = await showFileContent({
      filepath: cryptPathResolver.relative(catalogConfigPath, true),
      commitHash: context.cryptCommitId,
      cwd: cryptPathResolver.root,
      reporter,
    })

    const cipherConfigKeeper = new GitCipherConfigKeeper({
      MAX_CRYPT_FILE_SIZE: catalog.context.MAX_CRYPT_FILE_SIZE,
      PART_CODE_PREFIX: catalog.context.PART_CODE_PREFIX,
      cipherFactory: catalogCipherFactory,
      resource: new MemoTextResource({ strict: false, encoding: 'utf8', content: catalogContent }),
      genNonceByCommitMessage: secretMaster.genNonceByCommitMessage,
    })
    const cipherConfig: IGitCipherConfig = await cipherConfigKeeper.load()
    const items: ICatalogItem[] = await Promise.all<ICatalogItem>(
      cipherConfig.catalog.items.map(
        async (item): Promise<ICatalogItem> => catalog.flatItem(item),
      ) ?? [],
    )

    const filetree = FileTree.fromRawNodes(
      items.map(item => ({
        type: FileTreeNodeTypeEnum.FILE,
        pathFromRoot: splitPathFromRoot(item.plainPath),
        ctime: 0,
        mtime: 0,
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
