import type { ICipherFactory } from '@guanghechen/helper-cipher'
import { FileCipherCatalog, normalizePlainFilepath } from '@guanghechen/helper-cipher-file'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { list2map } from '@guanghechen/helper-func'
import type { IGitCommandBaseParams } from '@guanghechen/helper-git'
import { checkBranch, isGitRepo, listAllFiles } from '@guanghechen/helper-git'
import type { IFileCipherCatalogItemInstance } from '@guanghechen/helper-git-cipher'
import { GitCipherConfigKeeper } from '@guanghechen/helper-git-cipher'
import { FilepathResolver } from '@guanghechen/helper-path'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import { existsSync } from 'fs'
import micromatch from 'micromatch'
import { logger } from '../../env/logger'
import { CatalogCacheKeeper } from '../../util/CatalogCache'
import { SecretConfigKeeper } from '../../util/SecretConfig'
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
      isGitRepo(plainPathResolver.rootDir),
      `[${title}] Crypt dir is not a git repo. ${cryptPathResolver.rootDir}`,
    )

    invariant(
      existsSync(plainPathResolver.rootDir),
      `[${title}] Cannot find plainRootDir. ${plainPathResolver.rootDir}`,
    )

    invariant(
      isGitRepo(plainPathResolver.rootDir),
      `[${title}] plain dir is not a git repo. ${plainPathResolver.rootDir}`,
    )

    const cryptCtx: IGitCommandBaseParams = { cwd: cryptPathResolver.rootDir, logger }
    const plainCtx: IGitCommandBaseParams = { cwd: plainPathResolver.rootDir, logger }

    const cryptCommitId = context.cryptCommitId
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

    invariant(!!plainCommitId, `[${title}] Missing plainCommitId.`)

    try {
      await checkBranch({ commitHash: cryptCommitId, ...cryptCtx })

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
        !!secretKeeper.data && !!cipherFactory,
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
      const catalog = new FileCipherCatalog({
        contentHashAlgorithm,
        cryptFilepathSalt,
        cryptFilesDir,
        maxTargetFileSize,
        partCodePrefix,
        pathHashAlgorithm,
        plainPathResolver,
        logger,
        isKeepPlain:
          keepPlainPatterns.length > 0
            ? sourceFile => micromatch.isMatch(sourceFile, keepPlainPatterns, { dot: true })
            : () => false,
      })

      const configKeeper = new GitCipherConfigKeeper({
        cipher: cipherFactory.cipher(),
        storage: new FileStorage({ strict: true, filepath: catalogFilepath, encoding: 'utf8' }),
      })
      await configKeeper.load()

      const catalogItemMap: Map<string, IFileCipherCatalogItemInstance> = list2map(
        configKeeper.data?.catalog.items ?? [],
        item => normalizePlainFilepath(item.plainFilepath, plainPathResolver),
      )
      const allPlainFiles: string[] = await listAllFiles({ commitHash: plainCommitId, ...plainCtx })
      invariant(
        catalogItemMap.size === allPlainFiles.length,
        `[${title}] File count not matched. expect(${allPlainFiles.length}), received(${catalogItemMap.size})`,
      )

      for (const plainFilepath of allPlainFiles) {
        const key: string = normalizePlainFilepath(plainFilepath, plainPathResolver)
        const item: IFileCipherCatalogItemInstance | undefined = catalogItemMap.get(key)
        invariant(item !== undefined, `[${title}] Missing file. plainFilepath(${plainFilepath})`)

        const expectedItem = await catalog.calcCatalogItem({ plainFilepath })
        invariant(
          item.fingerprint === expectedItem.fingerprint,
          `[${title}] Bad file content, fingerprint are not matched. plainFilepath(${plainFilepath})`,
        )
        invariant(
          item.size === expectedItem.size,
          `[${title}] Bad file content, file size are not matched. plainFilepath(${plainFilepath})`,
        )
      }
      logger.info(`Everything looks good!`)
    } finally {
      await checkBranch({ commitHash: cryptCommitId, ...cryptCtx })
    }
  }
}
