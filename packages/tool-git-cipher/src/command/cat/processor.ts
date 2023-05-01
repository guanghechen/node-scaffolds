import { FileCipher, calcCryptFilepath, calcCryptFilepaths } from '@guanghechen/helper-cipher-file'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isGitRepo } from '@guanghechen/helper-git'
import { FilepathResolver } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'fs'
import { logger } from '../../core/logger'
import { loadGitCipherContext } from '../../util/context/loadGitCipherContext'
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
    invariant(hasGitInstalled(), `[${title}] Cannot find git, have you installed it?`)

    const { context } = this
    const cryptPathResolver = new FilepathResolver(context.cryptRootDir)
    invariant(
      existsSync(cryptPathResolver.rootDir),
      `[${title}] Cannot find cryptRootDir. ${cryptPathResolver.rootDir}`,
    )
    invariant(
      isGitRepo(cryptPathResolver.rootDir),
      `[${title}] cryptRootDir is not a git repo. ${cryptPathResolver.rootDir}`,
    )

    const { cipherFactory, context: gitCipherContext } = await loadGitCipherContext({
      cryptRootDir: context.cryptRootDir,
      secretFilepath: context.secretFilepath,
      secretMaster: this.secretMaster,
    })

    const { catalogContext, configKeeper, getIv } = gitCipherContext
    await configKeeper.load()

    // Print catalog config.
    if (!context.plainFilepath) {
      console.log(
        JSON.stringify(
          configKeeper.data,
          (key, value) => {
            return key === 'authTag' && value?.type === 'Buffer'
              ? Buffer.from(value).toString('hex')
              : value
          },
          2,
        ),
      )
      return
    }

    // Print plain file content.
    const plainPathResolver = new FilepathResolver(context.plainRootDir)
    const plainFilepath = plainPathResolver.relative(context.plainFilepath)
    const item = configKeeper.data?.catalog.items.find(item => item.plainFilepath === plainFilepath)
    invariant(!!item, `[${title}] Cannot find plainFilepath ${context.plainFilepath}.`)

    const cryptFilepath: string = calcCryptFilepath(
      plainPathResolver.relative(plainFilepath),
      catalogContext,
    )
    const cryptFilepaths: string[] = calcCryptFilepaths(
      cryptPathResolver.absolute(cryptFilepath),
      item.cryptFilepathParts,
    )
    const fileCipher = new FileCipher({
      cipher: cipherFactory.cipher({ iv: getIv(item) }),
      logger,
    })
    const plainContentBuffer: Buffer = await fileCipher.decryptFromFiles(cryptFilepaths, {
      authTag: item.authTag,
    })
    const plainContent: string = plainContentBuffer.toString('utf8')
    console.log(plainContent)
  }
}
