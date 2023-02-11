import type { ISubCommandEncryptOptions } from './option'

export interface IGitCipherEncryptContext {
  /**
   * The path of catalog cache file of crypt repo. (relative of workspace)
   */
  readonly catalogCacheFilepath: string
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
   * The directory where the plain repo located.
   */
  readonly plainRootDir: string
  /**
   * The path of secret file.
   */
  readonly secretFilepath: string
  /**
   * Whether to print password asterisks.
   */
  readonly showAsterisk: boolean
  /**
   * Working directory.
   */
  readonly workspace: string
}

export async function createGitCipherEncryptContextFromOptions(
  options: ISubCommandEncryptOptions,
): Promise<IGitCipherEncryptContext> {
  const context: IGitCipherEncryptContext = {
    catalogCacheFilepath: options.catalogCacheFilepath,
    cryptRootDir: options.cryptRootDir,
    cwd: options.cwd,
    encoding: options.encoding,
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
