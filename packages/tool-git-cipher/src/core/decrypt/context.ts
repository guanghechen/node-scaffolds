import type { ISubCommandDecryptOptions } from './option'

export interface IGitCipherDecryptContext {
  /**
   * The path of catalog cache file of crypt repo. (absolute path)
   */
  readonly catalogCacheFilepath: string
  /**
   * The directory where the crypt repo located. (absolute path)
   */
  readonly cryptRootDir: string
  /**
   * Path of currently executing command. (absolute path)
   */
  readonly cwd: string
  /**
   * Default encoding of files in the workspace.
   */
  readonly encoding: string
  /**
   * If specified, then all of the files under the given commitId will be decrypted.
   * Otherwise, the entire repo will be generated.
   */
  readonly filesOnly: string | null
  /**
   * The maximum size required of password.
   */
  readonly maxPasswordLength: number
  /**
   * max wrong password retry times
   */
  readonly maxRetryTimes: number
  /**
   * The minimum size required of password.
   */
  readonly minPasswordLength: number
  /**
   * Root dir of decrypted outputs. (absolute path)
   */
  readonly outDir: string | null
  /**
   * The directory where the plain repo located. (absolute path)
   */
  readonly plainRootDir: string
  /**
   * The path of secret file. (absolute path)
   */
  readonly secretFilepath: string
  /**
   * Whether to print password asterisks.
   */
  readonly showAsterisk: boolean
  /**
   * Working directory. (absolute path)
   */
  readonly workspace: string
}

export async function createGitCipherDecryptContextFromOptions(
  options: ISubCommandDecryptOptions,
): Promise<IGitCipherDecryptContext> {
  const context: IGitCipherDecryptContext = {
    catalogCacheFilepath: options.catalogCacheFilepath,
    cryptRootDir: options.cryptRootDir,
    cwd: options.cwd,
    encoding: options.encoding,
    filesOnly: options.filesOnly,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    outDir: options.outDir,
    plainRootDir: options.plainRootDir,
    secretFilepath: options.secretFilepath,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
  }
  return context
}
