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
import { coverString } from '@guanghechen/helper-option'
import { FilepathResolver } from '@guanghechen/helper-path'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import { logger } from '../../env/logger'
import type { ICatalogCache } from '../../util/CatalogCache'
import { CatalogCacheKeeper } from '../../util/CatalogCache'
import { SecretMaster } from '../../util/SecretMaster'
import type { IGitCipherDecryptContext } from './context'

export class GitCipherDecryptProcessor {
  protected readonly context: IGitCipherDecryptContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherDecryptContext) {
    logger.debug('context:', context)

    this.context = context
    this.secretMaster = new SecretMaster({
      showAsterisk: context.showAsterisk,
      maxRetryTimes: context.maxRetryTimes,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async decrypt(): Promise<void> {
    invariant(hasGitInstalled(), '[processor.decrypt] Cannot find git, have you installed it?')

    const { context, secretMaster } = this
    const secretKeeper = await secretMaster.load({
      filepath: context.secretFilepath,
      cryptRootDir: context.cryptRootDir,
    })

    const cipherFactory: ICipherFactory | undefined = secretMaster.cipherFactory
    const catalogContext: FileCipherCatalogContext | undefined = secretKeeper.createCatalogContext()
    invariant(
      !!secretKeeper.data && !!catalogContext && !!cipherFactory && !!secretMaster.catalogCipher,
      '[processor.decrypt] Secret cipherFactory is not available!',
    )

    const {
      catalogFilepath,
      maxTargetFileSize = Number.POSITIVE_INFINITY,
      partCodePrefix,
    } = secretKeeper.data
    const fileCipherFactory: IFileCipherFactory = new FileCipherFactory({ cipherFactory, logger })
    const fileHelper = new BigFileHelper({ partCodePrefix: partCodePrefix })
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

    const outRootDir = coverString(context.plainRootDir, context.outDir)
    const plainPathResolver = new FilepathResolver(outRootDir)
    const cryptPathResolver = new FilepathResolver(context.cryptRootDir)
    const catalog = new FileCipherCatalog({ context: catalogContext, plainPathResolver })
    const gitCipher = new GitCipher({
      catalog,
      cipherBatcher,
      configKeeper,
      logger,
      getDynamicIv: secretMaster.getDynamicIv,
    })

    // decrypt files
    if (context.filesAt || context.filesOnly.length > 0) {
      logger.debug('Trying decryptFilesOnly...')
      await gitCipher.decryptFilesOnly({
        cryptCommitId: context.filesAt ?? 'HEAD',
        cryptPathResolver,
        plainPathResolver,
        filesOnly: context.filesOnly,
      })
    } else {
      logger.debug('Trying decrypt entire repo...')

      const cacheKeeper = new CatalogCacheKeeper({
        storage: new FileStorage({
          strict: true,
          filepath: context.catalogCacheFilepath,
          encoding: 'utf8',
        }),
      })
      await cacheKeeper.load()
      const data: ICatalogCache = cacheKeeper.data ?? { crypt2plainIdMap: new Map() }
      const { crypt2plainIdMap } = await gitCipher.decrypt({
        cryptPathResolver,
        crypt2plainIdMap: new Map(data.crypt2plainIdMap),
        gpgSign: context.gitGpgSign,
        plainPathResolver,
      })
      await cacheKeeper.update({ crypt2plainIdMap })
      await cacheKeeper.save()
    }
  }
}
