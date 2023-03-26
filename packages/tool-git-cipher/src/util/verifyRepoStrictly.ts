import type { ICipher, ICipherFactory } from '@guanghechen/helper-cipher'
import type { IFileCipherFactory } from '@guanghechen/helper-cipher-file'
import {
  FileCipherBatcher,
  FileCipherCatalog,
  FileCipherFactory,
} from '@guanghechen/helper-cipher-file'
import { BigFileHelper } from '@guanghechen/helper-file'
import { showCommitInfo } from '@guanghechen/helper-git'
import { GitCipher, GitCipherConfigKeeper } from '@guanghechen/helper-git-cipher'
import type { FilepathResolver } from '@guanghechen/helper-path'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import micromatch from 'micromatch'
import { logger } from '../env/logger'
import { CatalogCacheKeeper } from './CatalogCache'
import type { ISecretConfig } from './SecretConfig.types'

export interface IVerifyCryptRepoParams {
  readonly catalogCacheFilepath: string
  readonly catalogCipher: ICipher | undefined
  readonly cipherFactory: ICipherFactory | undefined
  readonly cryptCommitId: string
  readonly cryptPathResolver: FilepathResolver
  readonly plainCommitId: string | undefined
  readonly plainPathResolver: FilepathResolver
  readonly secretConfig: Readonly<ISecretConfig>
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
}

export async function verifyRepoStrictly(params: IVerifyCryptRepoParams): Promise<void> {
  const title = 'verifyRepoStrictly'
  const {
    catalogCacheFilepath,
    catalogCipher,
    cipherFactory,
    cryptPathResolver,
    plainPathResolver,
    secretConfig,
    getDynamicIv,
  } = params

  invariant(
    !!cipherFactory && !!catalogCipher,
    `[${title}] cipherFactory or catalogCipher is not available!`,
  )

  // To avoid the `HEAD` reference.
  const cryptCommitId: string = (
    await showCommitInfo({
      commitHash: params.cryptCommitId,
      cwd: cryptPathResolver.rootDir,
      logger,
    })
  ).commitId

  let plainCommitId = params.plainCommitId
  if (!plainCommitId) {
    const cacheKeeper = new CatalogCacheKeeper({
      storage: new FileStorage({
        strict: true,
        filepath: catalogCacheFilepath,
        encoding: 'utf8',
      }),
    })

    await cacheKeeper.load()
    const { crypt2plainIdMap } = cacheKeeper.data ?? { crypt2plainIdMap: new Map() }
    plainCommitId = crypt2plainIdMap.get(cryptCommitId)
  }

  logger.debug(`[${title}] cryptCommitId(${cryptCommitId}), plainCommitId(${plainCommitId}).`)
  invariant(!!plainCommitId, `[${title}] Missing plainCommitId.`)

  const {
    catalogFilepath,
    contentHashAlgorithm,
    cryptFilepathSalt,
    cryptFilesDir,
    keepPlainPatterns,
    maxTargetFileSize = Number.POSITIVE_INFINITY,
    partCodePrefix,
    pathHashAlgorithm,
  } = secretConfig

  const configKeeper = new GitCipherConfigKeeper({
    cipher: catalogCipher,
    storage: new FileStorage({
      strict: true,
      filepath: catalogFilepath,
      encoding: 'utf8',
    }),
  })

  const fileCipherFactory: IFileCipherFactory = new FileCipherFactory({ cipherFactory, logger })
  const fileHelper = new BigFileHelper({ partCodePrefix })
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
    getDynamicIv,
  })

  await gitCipher.verifyCommit({
    cryptCommitId,
    cryptPathResolver,
    plainCommitId,
    plainPathResolver,
  })
}
