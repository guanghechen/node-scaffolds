import type { ICipherFactory } from '@guanghechen/helper-cipher'
import type { IFileCipherFactory } from '@guanghechen/helper-cipher-file'
import {
  FileCipherBatcher,
  FileCipherCatalog,
  FileCipherFactory,
  FileCipherPathResolver,
} from '@guanghechen/helper-cipher-file'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { BigFileHelper } from '@guanghechen/helper-file'
import { GitCipher, GitCipherConfig } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import micromatch from 'micromatch'
import { logger } from '../../env/logger'
import type { ICatalogCacheData } from '../../util/CatalogCache'
import { CatalogCacheKeeper } from '../../util/CatalogCache'
import { SecretConfigKeeper } from '../../util/SecretConfig'
import { SecretMaster } from '../../util/SecretMaster'
import type { IGitCipherEncryptContext } from './context'

export class GitCipherEncryptProcessor {
  protected readonly context: IGitCipherEncryptContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherEncryptContext) {
    logger.debug('context:', context)

    this.context = context
    this.secretMaster = new SecretMaster({
      showAsterisk: context.showAsterisk,
      maxRetryTimes: context.maxRetryTimes,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async encrypt(): Promise<void> {
    invariant(hasGitInstalled(), '[processor.encrypt] Cannot find git, have you installed it?')

    const { context, secretMaster } = this
    const secretKeeper = new SecretConfigKeeper({
      filepath: context.secretFilepath,
      cryptRootDir: context.cryptRootDir,
    })
    await secretMaster.load(secretKeeper)

    const cipherFactory: ICipherFactory | null = secretMaster.cipherFactory
    invariant(
      !!secretKeeper.data && !!cipherFactory,
      '[processor.encrypt] Secret cipherFactory is not available!',
    )

    const {
      catalogFilepath,
      cryptFilepathSalt,
      cryptFilesDir,
      keepPlainPatterns,
      maxTargetFileSize = Number.POSITIVE_INFINITY,
      partCodePrefix,
    } = secretKeeper.data

    const fileCipherFactory: IFileCipherFactory = new FileCipherFactory({ cipherFactory, logger })
    const fileHelper = new BigFileHelper({ partCodePrefix })
    const configKeeper = new GitCipherConfig({
      cipher: cipherFactory.cipher(),
      filepath: catalogFilepath,
    })
    const cipherBatcher = new FileCipherBatcher({
      fileCipherFactory,
      fileHelper,
      maxTargetFileSize,
      logger,
    })
    const gitCipher = new GitCipher({ cipherBatcher, configKeeper, logger })

    // encrypt files
    const pathResolver = new FileCipherPathResolver({
      plainRootDir: context.plainRootDir,
      cryptRootDir: context.cryptRootDir,
    })
    const catalog = new FileCipherCatalog({
      cryptFilepathSalt,
      cryptFilesDir,
      maxTargetFileSize,
      partCodePrefix,
      pathResolver,
      logger,
      isKeepPlain:
        keepPlainPatterns.length > 0
          ? sourceFile => micromatch.isMatch(sourceFile, keepPlainPatterns, { dot: true })
          : () => false,
    })

    const cacheKeeper = new CatalogCacheKeeper({ filepath: context.catalogCacheFilepath })
    const data: ICatalogCacheData = cacheKeeper.data ?? { crypt2plainIdMap: [] }
    const { crypt2plainIdMap } = await gitCipher.encrypt({
      pathResolver,
      catalog,
      crypt2plainIdMap: new Map(data.crypt2plainIdMap),
    })
    await cacheKeeper.update({ crypt2plainIdMap: Array.from(crypt2plainIdMap.entries()) })
    await cacheKeeper.save()
  }
}
