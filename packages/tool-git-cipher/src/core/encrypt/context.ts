import type { ISubCommandEncryptOptions } from './option'

/**
 * Context variables for GitCipherEncryptContext
 */
export interface IGitCipherEncryptContext {
  /**
   * Path of currently executing command
   */
  readonly cwd: string
  /**
   * Working directory
   */
  readonly workspace: string
  /**
   * default encoding of files in the workspace
   */
  readonly encoding: string
  /**
   * path of secret file
   */
  readonly secretFilepath: string
  /**
   * path of index file of ciphertext files
   */
  readonly indexFilepath: string
  /**
   * Encoding of ciphered index file
   */
  readonly cipheredIndexEncoding: string
  /**
   * the directory where the encrypted files are stored
   */
  readonly ciphertextRootDir: string
  /**
   * the directory where the source plaintext files are stored
   */
  readonly plaintextRootDir: string
  /**
   * List of directories to encrypt
   */
  readonly sensitiveDirectories: string[]
  /**
   * whether to print password asterisks
   */
  readonly showAsterisk: boolean
  /**
   * the minimum size required of password
   */
  readonly minPasswordLength: number
  /**
   * the maximum size required of password
   */
  readonly maxPasswordLength: number
  /**
   * Whether to update in full, if not, only update files whose mtime is less
   * than the mtime recorded in the index file
   */
  readonly full: boolean
  /**
   * Perform `git fetch --all` before encrypt
   */
  readonly updateBeforeEncrypt: boolean
  /**
   * Max size (byte) of target file, once the file size exceeds this value,
   * the target file is split into multiple files.
   */
  readonly maxTargetFileSize?: number
}

/**
 * Create GitCipherEncryptContext
 * @param options
 */
export async function createGitCipherEncryptContextFromOptions(
  options: ISubCommandEncryptOptions,
): Promise<IGitCipherEncryptContext> {
  const context: IGitCipherEncryptContext = {
    cwd: options.cwd,
    workspace: options.workspace,
    encoding: options.encoding,
    secretFilepath: options.secretFilepath,
    indexFilepath: options.indexFilepath,
    cipheredIndexEncoding: options.cipheredIndexEncoding,
    ciphertextRootDir: options.ciphertextRootDir,
    plaintextRootDir: options.plaintextRootDir,
    sensitiveDirectories: options.sensitiveDirectories,
    showAsterisk: options.showAsterisk,
    minPasswordLength: options.minPasswordLength,
    maxPasswordLength: options.maxPasswordLength,
    maxTargetFileSize: options.maxTargetFileSize,
    full: options.full,
    updateBeforeEncrypt: options.updateBeforeEncrypt,
  }
  return context
}
