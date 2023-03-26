import type { ICipher, ICipherFactory } from '@guanghechen/helper-cipher'
import { FileCipherCatalog } from '@guanghechen/helper-cipher-file'
import { showCommitInfo } from '@guanghechen/helper-git'
import { GitCipherConfigKeeper, verifyCryptGitCommit } from '@guanghechen/helper-git-cipher'
import type { FilepathResolver } from '@guanghechen/helper-path'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import micromatch from 'micromatch'
import { logger } from '../env/logger'
import type { ISecretConfig } from './SecretConfig.types'

export interface IVerifyCryptRepoParams {
  readonly catalogCipher: ICipher | undefined
  readonly cipherFactory: ICipherFactory | undefined
  readonly cryptCommitId: string
  readonly cryptPathResolver: FilepathResolver
  readonly plainPathResolver: FilepathResolver
  readonly secretConfig: Readonly<ISecretConfig>
}

export async function verifyCryptRepo(params: IVerifyCryptRepoParams): Promise<void> {
  const title = 'verifyCryptRepo'
  const { catalogCipher, cipherFactory, cryptPathResolver, plainPathResolver, secretConfig } =
    params

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

  await verifyCryptGitCommit({
    catalog,
    catalogFilepath,
    configKeeper,
    cryptCommitId,
    cryptPathResolver,
    logger,
  })
}
