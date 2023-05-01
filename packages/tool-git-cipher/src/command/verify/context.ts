import type { ISubCommandVerifyOptions } from './option'

export interface IGitCipherVerifyContext {
  /**
   * The path of catalog cache file of crypt repo. (absolute path)
   */
  readonly catalogCacheFilepath: string
  /**
   * Crypt repo branch or commit id.
   */
  readonly cryptCommitId: string
  /**
   * The directory where the crypt repo located. (absolute path)
   */
  readonly cryptRootDir: string
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
   * Plain repo branch or commit id.
   */
  readonly plainCommitId: string | undefined
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

export async function createVerifyContextFromOptions(
  options: ISubCommandVerifyOptions,
): Promise<IGitCipherVerifyContext> {
  const context: IGitCipherVerifyContext = {
    catalogCacheFilepath: options.catalogCacheFilepath,
    cryptCommitId: options.cryptCommitId,
    cryptRootDir: options.cryptRootDir,
    encoding: options.encoding,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    plainCommitId: options.plainCommitId,
    plainRootDir: options.plainRootDir,
    secretFilepath: options.secretFilepath,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
  }
  return context
}
