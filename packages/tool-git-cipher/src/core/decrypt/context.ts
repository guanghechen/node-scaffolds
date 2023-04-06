import { coverString } from '@guanghechen/helper-option'
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
   * Default encoding of files in the workspace.
   */
  readonly encoding: string
  /**
   * Crypt repo commit hash, worked with --files-only.
   */
  readonly filesAt: string | undefined
  /**
   * If specified, the following behavior depends on the value:
   *    - `false`: Decrypt entire git repo.
   *    - `Empty array`: Decrypt all files from crypt repo.
   *    - `Non-Empty array`: Decrypt files in the filesOnly from crypt repo.
   * @default false
   */
  readonly filesOnly: string[]
  /**
   * Set the git config 'commit.gpgSign'.
   */
  readonly gitGpgSign: boolean | undefined
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

export async function createGitCipherDecryptContextFromOptions(
  options: ISubCommandDecryptOptions,
): Promise<IGitCipherDecryptContext> {
  const context: IGitCipherDecryptContext = {
    catalogCacheFilepath: options.catalogCacheFilepath,
    cryptRootDir: options.cryptRootDir,
    encoding: options.encoding,
    filesAt: options.filesAt,
    filesOnly: options.filesOnly,
    gitGpgSign: options.gitGpgSign,
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
