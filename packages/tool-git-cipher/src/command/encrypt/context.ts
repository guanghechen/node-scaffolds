import type { ISubCommandEncryptOptions } from './option'

export interface IGitCipherEncryptContext {
  /**
   * The path of catalog cache file of crypt repo. (absolute path)
   */
  readonly catalogCacheFilepath: string
  /**
   * The directory where the crypt repo located. (absolute path)
   */
  readonly cryptRootDir: string
  /**
   * Default encoding of files in the workspace.
   */
  readonly encoding: string
  /**
   * Determines whether `plainRootDir` represents the root directory of source files
   * or the root directory of a git repository containing the source files.
   *
   * - true: the `plainRootDir` is the root directory of some source files.
   * - false: the `plainRootDir` is the root directory of the git repo where the source files located.
   */
  readonly filesOnly: boolean
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

export async function createEncryptContextFromOptions(
  options: ISubCommandEncryptOptions,
): Promise<IGitCipherEncryptContext> {
  const context: IGitCipherEncryptContext = {
    catalogCacheFilepath: options.catalogCacheFilepath,
    cryptRootDir: options.cryptRootDir,
    encoding: options.encoding,
    filesOnly: options.filesOnly,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    plainRootDir: options.plainRootDir,
    secretFilepath: options.secretFilepath,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
  }
  return context
}
