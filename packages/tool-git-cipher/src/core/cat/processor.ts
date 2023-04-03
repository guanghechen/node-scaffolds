import type { ICipherFactory } from '@guanghechen/helper-cipher'
import type { FileCipherCatalogContext } from '@guanghechen/helper-cipher-file'
import { FileCipher, calcCryptFilepath, calcCryptFilepaths } from '@guanghechen/helper-cipher-file'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isGitRepo } from '@guanghechen/helper-git'
import { GitCipherConfigKeeper } from '@guanghechen/helper-git-cipher'
import { FilepathResolver } from '@guanghechen/helper-path'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'fs'
import { logger } from '../../env/logger'
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

    const secretKeeper = await secretMaster.load({
      filepath: context.secretFilepath,
      cryptRootDir: context.cryptRootDir,
    })

    const cipherFactory: ICipherFactory | undefined = secretMaster.cipherFactory
    const catalogContext: FileCipherCatalogContext | undefined = secretKeeper.createCatalogContext()
    invariant(
      !!secretKeeper.data && !!catalogContext && !!cipherFactory && !!secretMaster.catalogCipher,
      `[${title}] Secret cipherFactory is not available!`,
    )

    const { catalogFilepath } = secretKeeper.data
    const configKeeper = new GitCipherConfigKeeper({
      cipher: secretMaster.catalogCipher,
      storage: new FileStorage({ strict: true, encoding: 'utf8', filepath: catalogFilepath }),
    })
    await configKeeper.load()

    // Print catalog config.
    if (!context.plainFilepath) {
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
      cipher: cipherFactory.cipher({
        iv: secretMaster.getDynamicIv([
          Buffer.from(item.plainFilepath, 'utf8'),
          Buffer.from(item.fingerprint, 'hex'),
        ]),
      }),
      logger,
    })
    const plainContentBuffer: Buffer = await fileCipher.decryptFromFiles(cryptFilepaths, {
      authTag: item.authTag,
    })
    const plainContent: string = plainContentBuffer.toString('utf8')
    console.log(plainContent)
  }
}
