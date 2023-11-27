import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import { CipherCatalogContext } from '@guanghechen/helper-cipher-file'
import { showCommitInfo } from '@guanghechen/helper-git'
import { GitCipherConfigKeeper, verifyCryptGitCommit } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import type { IReporter } from '@guanghechen/reporter.types'
import { TextFileResource } from '@guanghechen/resource'
import micromatch from 'micromatch'
import type { ISecretConfig } from '../SecretConfig.types'

export interface IVerifyCryptRepoParams {
  readonly catalogCipher: ICipher | undefined
  readonly cipherFactory: ICipherFactory | undefined
  readonly cryptCommitId: string
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
  readonly reporter: IReporter
  readonly secretConfig: Readonly<ISecretConfig>
}

export async function verifyCryptRepo(params: IVerifyCryptRepoParams): Promise<void> {
  const title = 'verifyCryptRepo'
  const {
    catalogCipher,
    cipherFactory,
    plainPathResolver,
    cryptPathResolver,
    reporter,
    secretConfig,
  } = params

  invariant(
    !!cipherFactory && !!catalogCipher,
    `[${title}] cipherFactory or catalogCipher is not available!`,
  )

  // To avoid the `HEAD` reference.
  const cryptCommitId: string = (
    await showCommitInfo({
      commitHash: params.cryptCommitId,
      cwd: cryptPathResolver.root,
      reporter,
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
    resource: new TextFileResource({
      strict: true,
      filepath: catalogFilepath,
      encoding: 'utf8',
    }),
  })

  const catalogContext = new CipherCatalogContext({
    contentHashAlgorithm,
    cryptFilepathSalt,
    cryptFilesDir,
    maxTargetFileSize,
    partCodePrefix,
    pathHashAlgorithm,
    plainPathResolver,
    cryptPathResolver,
    isKeepPlain:
      keepPlainPatterns.length > 0
        ? sourceFile => micromatch.isMatch(sourceFile, keepPlainPatterns, { dot: true })
        : () => false,
  })
  await verifyCryptGitCommit({
    catalogContext,
    catalogFilepath,
    configKeeper,
    cryptCommitId,
    cryptPathResolver,
    reporter,
  })
}
