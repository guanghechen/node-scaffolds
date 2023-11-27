import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isGitRepo } from '@guanghechen/helper-git'
import { GitCipher } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'node:fs'
import { loadGitCipherContext } from '../../shared/util/context/loadGitCipherContext'
import { verifyCryptRepo } from '../../shared/util/verifyCryptRepo'
import { verifyRepoStrictly } from '../../shared/util/verifyRepoStrictly'
import type { IGitCipherSubCommandProcessor } from '../_base'
import { GitCipherSubCommandProcessor } from '../_base'
import type { IGitCipherVerifyContext } from './context'
import type { IGitCipherVerifyOptions } from './option'

type O = IGitCipherVerifyOptions
type C = IGitCipherVerifyContext

const clazz = 'GitCipherVerify'

export class GitCipherVerify
  extends GitCipherSubCommandProcessor<O, C>
  implements IGitCipherSubCommandProcessor<O, C>
{
  public override async process(): Promise<void> {
    const title = `${clazz}.process`
    invariant(hasGitInstalled(), `[${title}] Cannot find git, have you installed it?`)

    const { cryptPathResolver, plainPathResolver } = this.context
    invariant(
      existsSync(cryptPathResolver.root),
      `[${title}] Cannot find cryptRootDir. ${cryptPathResolver.root}`,
    )

    invariant(
      isGitRepo(cryptPathResolver.root),
      `[${title}] cryptRootDir is not a git repo. ${cryptPathResolver.root}`,
    )

    if (existsSync(plainPathResolver.root) && isGitRepo(plainPathResolver.root)) {
      await this._verifyStrict()
    } else {
      await this._verifyCryptRepo()
    }
  }

  protected async _verifyStrict(): Promise<void> {
    const { context, secretMaster, reporter } = this
    const { cryptPathResolver, plainPathResolver } = context
    const { context: gitCipherContext } = await loadGitCipherContext({
      secretFilepath: context.secretFilepath,
      secretMaster: this.secretMaster,
      cryptPathResolver,
      plainPathResolver,
      reporter,
    })
    const gitCipher = new GitCipher({ context: gitCipherContext })

    await verifyRepoStrictly({
      catalogCacheFilepath: context.catalogCacheFilepath,
      catalogCipher: secretMaster.catalogCipher,
      cipherFactory: secretMaster.cipherFactory,
      cryptCommitId: context.cryptCommitId,
      cryptPathResolver,
      gitCipher,
      plainCommitId: context.plainCommitId,
      plainPathResolver,
      reporter,
    })
  }

  protected async _verifyCryptRepo(): Promise<void> {
    const title = `${clazz}.process`
    const { context, secretMaster, reporter } = this
    const {
      secretFilepath, //
      cryptCommitId,
      cryptPathResolver,
      plainPathResolver,
    } = context

    const secretKeeper = await secretMaster.load({
      filepath: secretFilepath,
      cryptRootDir: cryptPathResolver.root,
      force: true,
    })
    invariant(!!secretKeeper.data, `[${title}] secret is not available.`)

    await verifyCryptRepo({
      catalogCipher: secretMaster.catalogCipher,
      cipherFactory: secretMaster.cipherFactory,
      cryptCommitId,
      cryptPathResolver,
      plainPathResolver,
      secretConfig: secretKeeper.data,
      reporter,
    })
  }
}
