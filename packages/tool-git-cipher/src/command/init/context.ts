import type { IPBKDF2Options } from '@guanghechen/cipher'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import type { IWorkspacePathResolver } from '@guanghechen/path'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import type { ISubCommandInitOptions } from './option'

export interface IGitCipherInitContext {
  /**
   * The path of catalog file of crypt repo. (absolute path)
   */
  readonly catalogFilepath: string
  /**
   * The path of config file. (absolute path)
   */
  readonly configFilepaths: string[]
  /**
   * Hash algorithm for generate MAC for content.
   */
  readonly contentHashAlgorithm: IHashAlgorithm
  /**
   * Salt for generate encrypted file path. (utf8 string)
   */
  readonly cryptFilepathSalt: string
  /**
   * The path of not-plain files located. (relative of cryptRootDir)
   */
  readonly cryptFilesDir: string
  /**
   * Default encoding of files in the workspace.
   */
  readonly encoding: string
  /**
   * Set the git config 'commit.gpgSign'.
   */
  readonly gitGpgSign: boolean | undefined
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
   * The maximum size required of password.
   */
  readonly maxPasswordLength: number
  /**
   * Max wrong password retry times.
   */
  readonly maxRetryTimes: number
  /**
   * The minimum size required of password.
   */
  readonly minPasswordLength: number
  /**
   * Max size (byte) of target file, once the file size exceeds this value,
   * the target file is split into multiple files.
   */
  readonly maxTargetFileSize: number
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
   * The path of secret file. (absolute path)
   */
  readonly secretFilepath: string
  /**
   * IV size of the secret cipherFactory.
   */
  readonly secretIvSize: number
  /**
   * Key size of the secret cipherFactory.
   */
  readonly secretKeySize: number
  /**
   * Whether to print password asterisks.
   */
  readonly showAsterisk: boolean
  /**
   * Working directory. (absolute path)
   */
  readonly workspace: string
  /**
   * Crypt workspace path resolver.
   */
  readonly cryptPathResolver: IWorkspacePathResolver
  /**
   * Plain workspace path resolver.
   */
  readonly plainPathResolver: IWorkspacePathResolver
}

export async function createInitContextFromOptions(
  options: ISubCommandInitOptions,
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
    catalogFilepath: options.catalogFilepath,
    configFilepaths: options.configPath ?? [],
    contentHashAlgorithm: options.contentHashAlgorithm,
    cryptFilepathSalt: options.cryptFilepathSalt,
    cryptFilesDir: options.cryptFilesDir,
    encoding: options.encoding,
    gitGpgSign: options.gitGpgSign,
    keepPlainPatterns: options.keepPlainPatterns,
    mainIvSize: options.mainIvSize,
    mainKeySize: options.mainKeySize,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    maxTargetFileSize: options.maxTargetFileSize ?? Number.POSITIVE_INFINITY,
    partCodePrefix: options.partCodePrefix,
    pathHashAlgorithm: options.pathHashAlgorithm,
    pbkdf2Options: options.pbkdf2Options,
    secretFilepath: options.secretFilepath,
    secretIvSize: options.secretIvSize,
    secretKeySize: options.secretKeySize,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
    cryptPathResolver,
    plainPathResolver,
  }
  return context
}
