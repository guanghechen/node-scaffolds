import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isGitRepo } from '@guanghechen/helper-git'
import { GitCipher } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'node:fs'
import { SecretMaster } from '../../shared/SecretMaster'
import { loadGitCipherContext } from '../../shared/util/context/loadGitCipherContext'
import { verifyCryptRepo } from '../../shared/util/verifyCryptRepo'
import { verifyRepoStrictly } from '../../shared/util/verifyRepoStrictly'
import type { IGitCipherVerifyContext } from './context'

export class GitCipherVerifyProcessor {
  protected readonly context: IGitCipherVerifyContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherVerifyContext) {
    context.reporter.debug('context:', context)

    this.context = context
    this.secretMaster = new SecretMaster({
      showAsterisk: context.showAsterisk,
      maxRetryTimes: context.maxRetryTimes,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
      reporter: context.reporter,
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
      await this._verifyCryptRepo()
    }
  }

  protected async _verifyStrict(): Promise<void> {
    const { context, secretMaster } = this
    const { cryptPathResolver, plainPathResolver, reporter } = context
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
    const title = 'processor.verify'
    const { context, secretMaster } = this
    const {
      secretFilepath, //
      cryptCommitId,
      cryptPathResolver,
      plainPathResolver,
      reporter,
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
