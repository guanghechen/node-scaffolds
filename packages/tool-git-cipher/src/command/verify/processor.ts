import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isGitRepo } from '@guanghechen/helper-git'
import { GitCipher } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import { existsSync } from 'node:fs'
import { reporter } from '../../core/reporter'
import { loadGitCipherContext } from '../../util/context/loadGitCipherContext'
import { SecretMaster } from '../../util/SecretMaster'
import { verifyCryptRepo } from '../../util/verifyCryptRepo'
import { verifyRepoStrictly } from '../../util/verifyRepoStrictly'
import type { IGitCipherVerifyContext } from './context'

export class GitCipherVerifyProcessor {
  protected readonly context: IGitCipherVerifyContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherVerifyContext) {
    reporter.debug('context:', context)

    this.context = context
    this.secretMaster = new SecretMaster({
      showAsterisk: context.showAsterisk,
      maxRetryTimes: context.maxRetryTimes,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async verify(): Promise<void> {
    const title = 'processor.verify'
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
      await this._verifyCryptRepo(cryptPathResolver, plainPathResolver)
    }
  }

  protected async _verifyStrict(): Promise<void> {
    const { context, secretMaster } = this
    const { cryptPathResolver, plainPathResolver } = context
    const { context: gitCipherContext } = await loadGitCipherContext({
      secretFilepath: context.secretFilepath,
      secretMaster: this.secretMaster,
      cryptPathResolver,
      plainPathResolver,
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
    })
  }

  protected async _verifyCryptRepo(
    cryptPathResolver: IWorkspacePathResolver,
    plainPathResolver: IWorkspacePathResolver,
  ): Promise<void> {
    const title = 'processor.verify'
    const { context, secretMaster } = this

    const secretKeeper = await secretMaster.load({
      filepath: context.secretFilepath,
      cryptRootDir: context.cryptPathResolver.root,
      force: true,
    })
    invariant(!!secretKeeper.data, `[${title}] secret is not available.`)

    await verifyCryptRepo({
      catalogCipher: secretMaster.catalogCipher,
      cipherFactory: secretMaster.cipherFactory,
      cryptCommitId: context.cryptCommitId,
      cryptPathResolver,
      plainPathResolver,
      secretConfig: secretKeeper.data,
    })
  }
}
