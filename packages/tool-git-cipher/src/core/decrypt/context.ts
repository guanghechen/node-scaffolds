/**
 * Context variables for GitCipherDecryptContext
 */
export interface GitCipherDecryptContext {
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
   * encoding of secret file
   */
  readonly secretFileEncoding: string
  /**
   * path of index file of ciphertext files
   */
  readonly indexFilepath: string
  /**
   * encoding of index file
   */
  readonly indexFileEncoding: string
  /**
   * the directory where the decrypted files are stored
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
   * Root dir of outputs (decrypted files)
   */
  readonly outDir: string | null
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
   * encoding of secret file
   */
  readonly secretFileEncoding: string
  /**
   * path of index file of ciphertext files
   */
  readonly indexFilepath: string
  /**
   * encoding of index file
   */
  readonly indexFileEncoding: string
  /**
   * the directory where the decrypted files are stored
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
   * Root dir of outputs (decrypted files)
   */
  readonly outDir: string | null
}

/**
 * Create GitCipherDecryptContext
 *
 * @param params
 */
export async function createGitCipherDecryptContext(
  params: Params,
): Promise<GitCipherDecryptContext> {
  const context: GitCipherDecryptContext = {
    cwd: params.cwd,
    workspace: params.workspace,
    encoding: params.encoding,
    secretFilepath: params.secretFilepath,
    secretFileEncoding: params.secretFileEncoding,
    indexFilepath: params.indexFilepath,
    indexFileEncoding: params.indexFileEncoding,
    ciphertextRootDir: params.ciphertextRootDir,
    plaintextRootDir: params.plaintextRootDir,
    showAsterisk: params.showAsterisk,
    minPasswordLength: params.minPasswordLength,
    maxPasswordLength: params.maxPasswordLength,
    outDir: params.outDir,
  }
  return context
}
