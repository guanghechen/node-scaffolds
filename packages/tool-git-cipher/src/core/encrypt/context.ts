/**
 * Context variables for GitCipherEncryptContext
 */
export interface GitCipherEncryptContext {
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

interface Params {
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
 *
 * @param params
 */
export async function createGitCipherEncryptContext(
  params: Params,
): Promise<GitCipherEncryptContext> {
  const context: GitCipherEncryptContext = {
    cwd: params.cwd,
    workspace: params.workspace,
    encoding: params.encoding,
    secretFilepath: params.secretFilepath,
    indexFilepath: params.indexFilepath,
    cipheredIndexEncoding: params.cipheredIndexEncoding,
    ciphertextRootDir: params.ciphertextRootDir,
    plaintextRootDir: params.plaintextRootDir,
    showAsterisk: params.showAsterisk,
    minPasswordLength: params.minPasswordLength,
    maxPasswordLength: params.maxPasswordLength,
    full: params.full,
    updateBeforeEncrypt: params.updateBeforeEncrypt,
    maxTargetFileSize: params.maxTargetFileSize,
  }
  return context
}
