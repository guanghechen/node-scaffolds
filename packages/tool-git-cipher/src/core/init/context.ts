import type { ISubCommandInitOptions } from './option'

/**
 * Context variables for GitCipherInitContext
 */
export interface IGitCipherInitContext {
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
   * Max size (byte) of target file, once the file size exceeds this value,
   * the target file is split into multiple files.
   */
  readonly maxTargetFileSize?: number
}

/**
 * Create GitCipherInitContext
 * @param options
 */
export async function createGitCipherInitContextFromOptions(
  options: ISubCommandInitOptions,
): Promise<IGitCipherInitContext> {
  const context: IGitCipherInitContext = {
    cwd: options.cwd,
    workspace: options.workspace,
    encoding: options.encoding,
    secretFilepath: options.secretFilepath,
    indexFilepath: options.indexFilepath,
    cipheredIndexEncoding: options.cipheredIndexEncoding,
    ciphertextRootDir: options.ciphertextRootDir,
    plaintextRootDir: options.plaintextRootDir,
    showAsterisk: options.showAsterisk,
    minPasswordLength: options.minPasswordLength,
    maxPasswordLength: options.maxPasswordLength,
    maxTargetFileSize: options.maxTargetFileSize,
  }
  return context
}
