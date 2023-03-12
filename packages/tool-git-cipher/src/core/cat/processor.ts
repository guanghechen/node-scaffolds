import type { ICipherFactory } from '@guanghechen/helper-cipher'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isGitRepo, showFileContent } from '@guanghechen/helper-git'
import { GitCipherConfigKeeper } from '@guanghechen/helper-git-cipher'
import { FilepathResolver } from '@guanghechen/helper-path'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'fs'
import { logger } from '../../env/logger'
import { SecretConfigKeeper } from '../../util/SecretConfig'
import { SecretMaster } from '../../util/SecretMaster'
import type { IGitCipherCatContext } from './context'

export class GitCipherCatProcessor {
  protected readonly context: IGitCipherCatContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherCatContext) {
    logger.debug('context:', context)

    this.context = context
    this.secretMaster = new SecretMaster({
      showAsterisk: context.showAsterisk,
      maxRetryTimes: context.maxRetryTimes,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async cat(): Promise<void> {
    const title = 'processor.cat'
    const { context, secretMaster } = this
    const cryptPathResolver = new FilepathResolver(context.cryptRootDir)

    invariant(hasGitInstalled(), `[${title}] Cannot find git, have you installed it?`)

    invariant(
      existsSync(cryptPathResolver.rootDir),
      `[${title}] Cannot find cryptRootDir. ${cryptPathResolver.rootDir}`,
    )

    invariant(
      isGitRepo(cryptPathResolver.rootDir),
      `[${title}] cryptRootDir is not a git repo. ${cryptPathResolver.rootDir}`,
    )

    const secretKeeper = new SecretConfigKeeper({
      cryptRootDir: context.cryptRootDir,
      storage: new FileStorage({
        strict: true,
        filepath: context.secretFilepath,
        encoding: 'utf8',
      }),
    })
    await secretMaster.load(secretKeeper)

    const cipherFactory: ICipherFactory | null = secretMaster.cipherFactory
    invariant(
      !!secretKeeper.data && !!cipherFactory && !!secretMaster.catalogCipher,
      `[${title}] Secret cipherFactory is not available!`,
    )

    const { catalogFilepath } = secretKeeper.data
    const catalogContent: string = await showFileContent({
      filepath: cryptPathResolver.relative(catalogFilepath),
      commitHash: context.cryptCommitId,
      cwd: cryptPathResolver.rootDir,
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

    console.log(
      JSON.stringify(
        configKeeper.data,
        (key, value) => {
          if (key === 'authTag' && value?.type === 'Buffer')
            return Buffer.from(value).toString('hex')
          return value
        },
        2,
      ),
    )
  }
}
