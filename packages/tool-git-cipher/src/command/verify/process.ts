import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isGitRepo } from '@guanghechen/helper-git'
import { GitCipher } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'node:fs'
import type { ISecretConfig } from '../../shared/SecretConfig.types'
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
    const { context, reporter } = this
    const { cryptPathResolver, plainPathResolver, secretConfigPath } = context
    const gitCipherContext = await loadGitCipherContext({
      secretConfigPath,
      secretMaster: this.secretMaster,
      cryptPathResolver,
      plainPathResolver,
      reporter,
    })
    const gitCipher = new GitCipher({ context: gitCipherContext })

    await verifyRepoStrictly({
      catalogCachePath: context.catalogCachePath,
      cryptCommitId: context.cryptCommitId,
      cryptRootDir: cryptPathResolver.root,
      gitCipher,
      plainCommitId: context.plainCommitId,
      reporter,
    })
  }

  protected async _verifyCryptRepo(): Promise<void> {
    const { context, reporter } = this
    const { cryptCommitId, cryptPathResolver, plainPathResolver, secretConfigPath } = context
    const gitCipherContext = await loadGitCipherContext({
      secretConfigPath,
      secretMaster: this.secretMaster,
      cryptPathResolver,
      plainPathResolver,
      reporter,
    })
    const gitCipher = new GitCipher({ context: gitCipherContext })
    const { catalogConfigPath } = gitCipherContext

    await verifyCryptRepo({
      catalogConfigPath,
      cryptCommitId,
      cryptRootDir: cryptPathResolver.root,
      gitCipher,
      reporter,
    })
  }
}
