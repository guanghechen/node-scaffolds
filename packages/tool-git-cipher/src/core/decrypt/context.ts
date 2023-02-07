import type { IPBKDF2Options } from '@guanghechen/helper-cipher'
import type { ISubCommandDecryptOptions } from './option'

export interface IGitCipherDecryptContext {
  /**
   * Path of currently executing command.
   */
  readonly cwd: string
  /**
   * Working directory.
   */
  readonly workspace: string
  /**
   * Default encoding of files in the workspace.
   */
  readonly encoding: string
  /**
   * Options for PBKDF2 algorithm.
   */
  readonly pbkdf2Options: IPBKDF2Options
  /**
   * The path of secret file.
   */
  readonly secretFilepath: string
  /**
   * The path of catalog file of crypt repo.
   */
  readonly catalogFilepath: string
  /**
   * The directory where the plain repo located.
   */
  readonly plainRootDir: string
  /**
   * The directory where the crypt repo located.
   */
  readonly cryptRootDir: string
  /**
   * A relative path of cryptRootDir, where the encrypted files located.
   */
  readonly encryptedFilesDir: string
  /**
   * Whether to print password asterisks.
   */
  readonly showAsterisk: boolean
  /**
   * The minimum size required of password.
   */
  readonly minPasswordLength: number
  /**
   * The maximum size required of password.
   */
  readonly maxPasswordLength: number
  /**
   * Max size (byte) of target file, once the file size exceeds this value,
   * the target file is split into multiple files.
   */
  readonly maxTargetFileSize: number
  /**
   * Prefix of parts code.
   */
  readonly partCodePrefix: string
  /**
   * Glob patterns indicated which files should be keepPlain.
   * @default []
   */
  readonly keepPlainPatterns: string[]
  /**
   * Root dir of decrypted outputs.
   */
  readonly outDir: string | null
  /**
   * If specified, then all of the files under the given commitId will be decrypted.
   * Otherwise, the entire repo will be generated.
   */
  readonly filesAt: string | null
}

export async function createGitCipherDecryptContextFromOptions(
  options: ISubCommandDecryptOptions,
): Promise<IGitCipherDecryptContext> {
  const context: IGitCipherDecryptContext = {
    cwd: options.cwd,
    workspace: options.workspace,
    encoding: options.encoding,
    pbkdf2Options: options.pbkdf2Options,
    secretFilepath: options.secretFilepath,
    catalogFilepath: options.catalogFilepath,
    plainRootDir: options.workspace,
    cryptRootDir: options.cryptRootDir,
    encryptedFilesDir: options.encryptedFilesDir,
    showAsterisk: options.showAsterisk,
    minPasswordLength: options.minPasswordLength,
    maxPasswordLength: options.maxPasswordLength,
    maxTargetFileSize: options.maxTargetFileSize ?? Number.POSITIVE_INFINITY,
    partCodePrefix: options.partCodePrefix,
    keepPlainPatterns: options.keepPlainPatterns,
    outDir: options.outDir,
    filesAt: options.filesAt,
  }
  return context
}
