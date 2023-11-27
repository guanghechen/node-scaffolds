import type { IWorkspacePathResolver } from '@guanghechen/path'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import type { IReporter } from '@guanghechen/reporter.types'
import { reporter } from '../../shared/core/reporter'
import type { ISubCommandDecryptOptions } from './option'

export interface IGitCipherDecryptContext {
  /**
   * The path of catalog cache file of crypt repo. (absolute path)
   */
  readonly catalogCacheFilepath: string
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
  /**
   * Crypt workspace path resolver.
   */
  readonly cryptPathResolver: IWorkspacePathResolver
  /**
   * Plain workspace path resolver.
   */
  readonly plainPathResolver: IWorkspacePathResolver
  /**
   * Reporter to log debug/verbose/info/warn/error messages.
   */
  readonly reporter: IReporter
}

export async function createDecryptContextFromOptions(
  options: ISubCommandDecryptOptions,
): Promise<IGitCipherDecryptContext> {
  const cryptRootDir: string = options.cryptRootDir
  const plainRootDir: string = options.plainRootDir
  const cryptPathResolver: IWorkspacePathResolver = new WorkspacePathResolver(
    cryptRootDir,
    pathResolver,
  )
  const plainPathResolver: IWorkspacePathResolver = new WorkspacePathResolver(
    plainRootDir,
    pathResolver,
  )

  const context: IGitCipherDecryptContext = {
    catalogCacheFilepath: options.catalogCacheFilepath,
    encoding: options.encoding,
    filesAt: options.filesAt,
    filesOnly: options.filesOnly,
    gitGpgSign: options.gitGpgSign,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    secretFilepath: options.secretFilepath,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
    cryptPathResolver,
    plainPathResolver,
    reporter,
  }
  return context
}
