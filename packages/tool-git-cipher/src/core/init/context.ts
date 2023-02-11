import type { IPBKDF2Options } from '@guanghechen/helper-cipher'
import type { ISubCommandInitOptions } from './option'

export interface IGitCipherInitContext {
  /**
   * The path of catalog file of crypt repo. (relative of cryptRootDir)
   */
  readonly catalogFilepath: string
  /**
   * Salt for generate encrypted file path. (utf8 string)
   */
  readonly cryptFilepathSalt: string
  /**
   * The path of not-plain files located. (relative of cryptRootDir)
   */
  readonly cryptFilesDir: string
  /**
   * The directory where the crypt repo located.
   */
  readonly cryptRootDir: string
  /**
   * Path of currently executing command.
   */
  readonly cwd: string
  /**
   * Default encoding of files in the workspace.
   */
  readonly encoding: string
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
   * Options for PBKDF2 algorithm.
   */
  readonly pbkdf2Options: IPBKDF2Options
  /**
   * The directory where the plain repo located.
   */
  readonly plainRootDir: string
  /**
   * The path of secret file. (relative of workspace)
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
   * Working directory.
   */
  readonly workspace: string
}

export async function createGitCipherInitContextFromOptions(
  options: ISubCommandInitOptions,
): Promise<IGitCipherInitContext> {
  const context: IGitCipherInitContext = {
    catalogFilepath: options.catalogFilepath,
    cryptFilepathSalt: options.cryptFilepathSalt,
    cryptFilesDir: options.cryptFilesDir,
    cryptRootDir: options.cryptRootDir,
    cwd: options.cwd,
    encoding: options.encoding,
    keepPlainPatterns: options.keepPlainPatterns,
    mainIvSize: options.mainIvSize,
    mainKeySize: options.mainKeySize,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    maxTargetFileSize: options.maxTargetFileSize ?? Number.POSITIVE_INFINITY,
    partCodePrefix: options.partCodePrefix,
    pbkdf2Options: options.pbkdf2Options,
    plainRootDir: options.plainRootDir,
    secretFilepath: options.secretFilepath,
    secretIvSize: options.secretIvSize,
    secretKeySize: options.secretKeySize,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
  }
  return context
}
