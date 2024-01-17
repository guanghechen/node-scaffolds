import type { IPBKDF2Options } from '@guanghechen/cipher'
import type { IHashAlgorithm } from '@guanghechen/mac'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import type { IGitCipherSubCommandContext } from '../_base'
import type { IGitCipherInitOptions } from './option'

export interface IGitCipherInitContext extends IGitCipherSubCommandContext {
  /**
   * The path of catalog file of crypt repo. (absolute path)
   */
  readonly catalogConfigPath: string
  /**
   * The path of config file. (absolute path)
   */
  readonly configPaths: string[]
  /**
   * Hash algorithm for generate MAC for content.
   */
  readonly contentHashAlgorithm: IHashAlgorithm
  /**
   * The path of not-plain files located. (relative of cryptRootDir)
   */
  readonly cryptFilesDir: string
  /**
   * Salt for generate encrypted file path. (utf8 string)
   */
  readonly cryptPathSalt: string
  /**
   * Crypt workspace path resolver.
   */
  readonly cryptPathResolver: IWorkspacePathResolver
  /**
   * Default encoding of files in the workspace.
   */
  readonly encoding: string
  /**
   * Set the git config 'commit.gpgSign'.
   */
  readonly gitGpgSign: boolean | undefined
  /**
   * Glob patterns indicated which files should be keepIntegrity.
   * @default []
   */
  readonly integrityPatterns: string[]
  /**
   * Glob patterns indicated which files should be keepPlain.
   * @default []
   */
  readonly keepPlainPatterns: string[]
  /**
   * IV size of main cipherFactory.
   */
  readonly mainIvSize: number
  /**
   * Key size of main cipherFactory.
   */
  readonly mainKeySize: number
  /**
   * Max size (byte) of target file, once the file size exceeds this value,
   * the target file is split into multiple files.
   */
  readonly maxCryptFileSize: number
  /**
   * Prefix of splitted files parts code.
   */
  readonly partCodePrefix: string
  /**
   * Hash algorithm for generate MAC for filepath.
   */
  readonly pathHashAlgorithm: IHashAlgorithm
  /**
   * Options for PBKDF2 algorithm.
   */
  readonly pbkdf2Options: IPBKDF2Options
  /**
   * Plain workspace path resolver.
   */
  readonly plainPathResolver: IWorkspacePathResolver
  /**
   * The path of secret file. (absolute path)
   */
  readonly secretConfigPath: string
  /**
   * IV size of the secret cipherFactory.
   */
  readonly secretIvSize: number
  /**
   * Key size of the secret cipherFactory.
   */
  readonly secretKeySize: number
}

export async function createInitContextFromOptions(
  options: IGitCipherInitOptions,
): Promise<IGitCipherInitContext> {
  const cryptRootDir: string = options.cryptRootDir
  const plainRootDir: string = options.plainRootDir
  const cryptPathResolver: IWorkspacePathResolver = new WorkspacePathResolver(
    cryptRootDir,
    pathResolver,
  )
  const plainPathResolver: IWorkspacePathResolver = new WorkspacePathResolver(
    plainRootDir,
    pathResolver,
  )

  const context: IGitCipherInitContext = {
    catalogConfigPath: options.catalogConfigPath,
    configPaths: options.configPath ?? [],
    contentHashAlgorithm: options.contentHashAlgorithm,
    cryptPathSalt: options.cryptPathSalt,
    cryptFilesDir: options.cryptFilesDir,
    cryptPathResolver,
    encoding: options.encoding,
    gitGpgSign: options.gitGpgSign,
    integrityPatterns: options.integrityPatterns,
    keepPlainPatterns: options.keepPlainPatterns,
    mainIvSize: options.mainIvSize,
    mainKeySize: options.mainKeySize,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    maxCryptFileSize: options.maxCryptFileSize ?? Number.POSITIVE_INFINITY,
    partCodePrefix: options.partCodePrefix,
    pathHashAlgorithm: options.pathHashAlgorithm,
    pbkdf2Options: options.pbkdf2Options,
    plainPathResolver,
    secretConfigPath: options.secretConfigPath,
    secretIvSize: options.secretIvSize,
    secretKeySize: options.secretKeySize,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
  }
  return context
}
