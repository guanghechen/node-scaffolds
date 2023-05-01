import type { ISubCommandTreeOptions } from './option'

export interface IGitCipherTreeContext {
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

export async function createTreeContextFromOptions(
  options: ISubCommandTreeOptions,
): Promise<IGitCipherTreeContext> {
  const context: IGitCipherTreeContext = {
    cryptCommitId: options.filesAt,
    cryptRootDir: options.cryptRootDir,
    encoding: options.encoding,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    secretFilepath: options.secretFilepath,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
  }
  return context
}
