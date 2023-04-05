import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isGitRepo } from '@guanghechen/helper-git'
import { GitCipher } from '@guanghechen/helper-git-cipher'
import { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'fs'
import { logger } from '../../env/logger'
import { loadGitCipherContext } from '../../util/context/loadGitCipherContext'
import { SecretMaster } from '../../util/SecretMaster'
import { verifyCryptRepo } from '../../util/verifyCryptRepo'
import { verifyRepoStrictly } from '../../util/verifyRepoStrictly'
import type { IGitCipherVerifyContext } from './context'

export class GitCipherVerifyProcessor {
  protected readonly context: IGitCipherVerifyContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherVerifyContext) {
    logger.debug('context:', context)

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
    const plainPathResolver = new FilepathResolver(this.context.plainRootDir)
    const cryptPathResolver = new FilepathResolver(this.context.cryptRootDir)

    invariant(hasGitInstalled(), `[${title}] Cannot find git, have you installed it?`)

    invariant(
      existsSync(cryptPathResolver.rootDir),
      `[${title}] Cannot find cryptRootDir. ${cryptPathResolver.rootDir}`,
    )

    invariant(
      isGitRepo(cryptPathResolver.rootDir),
      `[${title}] cryptRootDir is not a git repo. ${cryptPathResolver.rootDir}`,
    )

    if (existsSync(plainPathResolver.rootDir) && isGitRepo(plainPathResolver.rootDir)) {
      await this._verifyStrict(cryptPathResolver, plainPathResolver)
    } else {
      await this._verifyCryptRepo(cryptPathResolver)
    }
  }

  protected async _verifyStrict(
    cryptPathResolver: FilepathResolver,
    plainPathResolver: FilepathResolver,
  ): Promise<void> {
    const { context, secretMaster } = this
    const { context: gitCipherContext } = await loadGitCipherContext({
      cryptRootDir: context.cryptRootDir,
      secretFilepath: context.secretFilepath,
      secretMaster: this.secretMaster,
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

  protected async _verifyCryptRepo(cryptPathResolver: FilepathResolver): Promise<void> {
    const title = 'processor.verify'
    const { context, secretMaster } = this

    const secretKeeper = await secretMaster.load({
      filepath: context.secretFilepath,
      cryptRootDir: context.cryptRootDir,
    })
    invariant(!!secretKeeper.data, `[${title}] secret is not available.`)

    await verifyCryptRepo({
      catalogCipher: secretMaster.catalogCipher,
      cipherFactory: secretMaster.cipherFactory,
      cryptCommitId: context.cryptCommitId,
      cryptPathResolver,
      secretConfig: secretKeeper.data,
    })
  }
}
