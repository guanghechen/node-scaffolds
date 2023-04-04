import type { ICipherFactory } from '@guanghechen/helper-cipher'
import type { FileCipherCatalogContext, IFileCipherFactory } from '@guanghechen/helper-cipher-file'
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

    const cipherFactory: ICipherFactory | undefined = secretMaster.cipherFactory
    const catalogContext: FileCipherCatalogContext | undefined = secretKeeper.createCatalogContext()
    invariant(
      !!secretKeeper.data && !!catalogContext && !!cipherFactory && !!secretMaster.catalogCipher,
      '[processor.encrypt] Secret cipherFactory is not available!',
    )

    const {
      catalogFilepath,
      maxTargetFileSize = Number.POSITIVE_INFINITY,
      partCodePrefix,
    } = secretKeeper.data
    const fileCipherFactory: IFileCipherFactory = new FileCipherFactory({ cipherFactory, logger })
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
      context: catalogContext,
      cryptPathResolver,
      plainPathResolver,
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
