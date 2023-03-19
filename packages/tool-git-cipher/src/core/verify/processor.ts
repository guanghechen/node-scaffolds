import type { ICipherFactory } from '@guanghechen/helper-cipher'
import type { IFileCipherFactory } from '@guanghechen/helper-cipher-file'
import {
  FileCipherBatcher,
  FileCipherCatalog,
  FileCipherFactory,
} from '@guanghechen/helper-cipher-file'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { BigFileHelper } from '@guanghechen/helper-file'
import { isGitRepo, showCommitInfo } from '@guanghechen/helper-git'
import { GitCipher, GitCipherConfigKeeper } from '@guanghechen/helper-git-cipher'
import { FilepathResolver } from '@guanghechen/helper-path'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'fs'
import micromatch from 'micromatch'
import { logger } from '../../env/logger'
import { CatalogCacheKeeper } from '../../util/CatalogCache'
import { SecretMaster } from '../../util/SecretMaster'
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
    const { context, secretMaster } = this
    const plainPathResolver = new FilepathResolver(context.plainRootDir)
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

    invariant(
      existsSync(plainPathResolver.rootDir),
      `[${title}] Cannot find plainRootDir. ${plainPathResolver.rootDir}`,
    )

    invariant(
      isGitRepo(plainPathResolver.rootDir),
      `[${title}] plainRootDir is not a git repo. ${plainPathResolver.rootDir}`,
    )

    const cryptCommitId: string = (
      await showCommitInfo({
        commitHash: context.cryptCommitId,
        cwd: cryptPathResolver.rootDir,
        logger,
      })
    ).commitId

    let plainCommitId = context.plainCommitId
    if (!plainCommitId) {
      const cacheKeeper = new CatalogCacheKeeper({
        storage: new FileStorage({
          strict: true,
          filepath: context.catalogCacheFilepath,
          encoding: 'utf8',
        }),
      })

      await cacheKeeper.load()
      const { crypt2plainIdMap } = cacheKeeper.data ?? { crypt2plainIdMap: new Map() }
      plainCommitId = crypt2plainIdMap.get(cryptCommitId)
    }

    logger.debug(`[${title}] cryptCommitId(${cryptCommitId}), plainCommitId(${plainCommitId}).`)
    invariant(!!plainCommitId, `[${title}] Missing plainCommitId.`)

    const secretKeeper = await secretMaster.load({
      filepath: context.secretFilepath,
      cryptRootDir: context.cryptRootDir,
    })

    const cipherFactory: ICipherFactory | undefined = secretMaster.cipherFactory
    invariant(
      !!secretKeeper.data && !!cipherFactory && !!secretMaster.catalogCipher,
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

    await gitCipher.verifyCommit({
      cryptCommitId,
      cryptPathResolver,
      plainCommitId,
      plainPathResolver,
    })
  }
}
