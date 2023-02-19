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
import { GitCipher, GitCipherConfig, decryptFilesOnly } from '@guanghechen/helper-git-cipher'
import { coverString } from '@guanghechen/helper-option'
import invariant from '@guanghechen/invariant'
import micromatch from 'micromatch'
import { logger } from '../../env/logger'
import type { ICatalogCache } from '../../util/CatalogCache'
import { CatalogCacheKeeper } from '../../util/CatalogCache'
import { SecretConfigKeeper } from '../../util/SecretConfig'
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
    const secretKeeper = new SecretConfigKeeper({
      filepath: context.secretFilepath,
      cryptRootDir: context.cryptRootDir,
    })
    await secretMaster.load(secretKeeper)

    const cipherFactory: ICipherFactory | null = secretMaster.cipherFactory
    invariant(
      !!secretKeeper.data && !!cipherFactory,
      '[processor.decrypt] Secret cipherFactory is not available!',
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

    const fileCipherFactory: IFileCipherFactory = new FileCipherFactory({ cipherFactory, logger })
    const fileHelper = new BigFileHelper({ partCodePrefix: partCodePrefix })
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

    // decrypt files
    const outRootDir = coverString(context.plainRootDir, context.outDir)
    const outPathResolver = new FileCipherPathResolver({
      plainRootDir: outRootDir,
      cryptRootDir: context.cryptRootDir,
    })

    if (context.filesOnly) {
      const catalog = new FileCipherCatalog({
        contentHashAlgorithm,
        cryptFilepathSalt,
        cryptFilesDir,
        maxTargetFileSize,
        partCodePrefix,
        pathHashAlgorithm,
        pathResolver: outPathResolver,
        logger,
        isKeepPlain:
          keepPlainPatterns.length > 0
            ? sourceFile => micromatch.isMatch(sourceFile, keepPlainPatterns, { dot: true })
            : () => false,
      })

      logger.debug('Trying decryptFilesOnly...')
      await decryptFilesOnly({
        catalog,
        cryptCommitId: context.filesOnly,
        cipherBatcher,
        pathResolver: outPathResolver,
        configKeeper,
        logger,
        getDynamicIv: secretMaster.getDynamicIv,
      })
    } else {
      logger.debug('Trying decrypt entire repo...')

      const cacheKeeper = new CatalogCacheKeeper({ filepath: context.catalogCacheFilepath })
      await cacheKeeper.load()
      const data: ICatalogCache = cacheKeeper.data ?? { crypt2plainIdMap: new Map() }
      const { crypt2plainIdMap } = await gitCipher.decrypt({
        pathResolver: outPathResolver,
        crypt2plainIdMap: new Map(data.crypt2plainIdMap),
        gpgSign: context.gitGpgSign,
      })
      await cacheKeeper.update({ crypt2plainIdMap })
      await cacheKeeper.save()
    }
  }
}
