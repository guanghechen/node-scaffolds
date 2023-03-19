import type { IFileCipherFactory } from '@guanghechen/helper-cipher-file'
import {
  FileCipherBatcher,
  FileCipherCatalog,
  FileCipherFactory,
} from '@guanghechen/helper-cipher-file'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { BigFileHelper } from '@guanghechen/helper-file'
import { GitCipher, GitCipherConfigKeeper } from '@guanghechen/helper-git-cipher'
import { FilepathResolver } from '@guanghechen/helper-path'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import micromatch from 'micromatch'
import { logger } from '../../env/logger'
import type { ICatalogCache } from '../../util/CatalogCache'
import { CatalogCacheKeeper } from '../../util/CatalogCache'
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
    const secretKeeper = await secretMaster.load({
      filepath: context.secretFilepath,
      cryptRootDir: context.cryptRootDir,
    })

    invariant(
      !!secretKeeper.data && !!secretMaster.cipherFactory && !!secretMaster.catalogCipher,
      '[processor.encrypt] Secret cipherFactory is not available!',
    )

    const {
      catalogFilepath,
      contentHashAlgorithm,
      cryptFilepathSalt,
      cryptFilesDir,
      keepPlainPatterns,
      maxTargetFileSize = Number.POSITIVE_INFINITY,
      partCodePrefix,
      pathHashAlgorithm,
    } = secretKeeper.data

    const fileCipherFactory: IFileCipherFactory = new FileCipherFactory({
      cipherFactory: secretMaster.cipherFactory,
      logger,
    })
    const fileHelper = new BigFileHelper({ partCodePrefix })
    const configKeeper = new GitCipherConfigKeeper({
      cipher: secretMaster.catalogCipher,
      storage: new FileStorage({
        strict: true,
        filepath: catalogFilepath,
        encoding: 'utf8',
      }),
    })
    const cipherBatcher = new FileCipherBatcher({
      fileCipherFactory,
      fileHelper,
      maxTargetFileSize,
      logger,
    })

    const plainPathResolver = new FilepathResolver(context.plainRootDir)
    const cryptPathResolver = new FilepathResolver(context.cryptRootDir)
    const catalog = new FileCipherCatalog({
      contentHashAlgorithm,
      cryptFilepathSalt,
      cryptFilesDir,
      maxTargetFileSize,
      partCodePrefix,
      pathHashAlgorithm,
      plainPathResolver,
      isKeepPlain:
        keepPlainPatterns.length > 0
          ? sourceFile => micromatch.isMatch(sourceFile, keepPlainPatterns, { dot: true })
          : () => false,
    })

    const gitCipher = new GitCipher({
      catalog,
      cipherBatcher,
      configKeeper,
      logger,
      getDynamicIv: secretMaster.getDynamicIv,
    })

    // encrypt files
    const cacheKeeper = new CatalogCacheKeeper({
      storage: new FileStorage({
        strict: true,
        filepath: context.catalogCacheFilepath,
        encoding: 'utf8',
      }),
    })
    await cacheKeeper.load()
    const data: ICatalogCache = cacheKeeper.data ?? { crypt2plainIdMap: new Map() }
    const { crypt2plainIdMap } = await gitCipher.encrypt({
      cryptPathResolver,
      crypt2plainIdMap: new Map(data.crypt2plainIdMap),
      plainPathResolver,
    })
    await cacheKeeper.update({ crypt2plainIdMap })
    await cacheKeeper.save()
  }
}
