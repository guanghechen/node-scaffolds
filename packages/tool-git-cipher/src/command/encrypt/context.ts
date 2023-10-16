import type { IWorkspacePathResolver } from '@guanghechen/path'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import type { ISubCommandEncryptOptions } from './option'

export interface IGitCipherEncryptContext {
  /**
   * The path of catalog cache file of crypt repo. (absolute path)
   */
  readonly catalogCacheFilepath: string
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
}

export async function createEncryptContextFromOptions(
  options: ISubCommandEncryptOptions,
): Promise<IGitCipherEncryptContext> {
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

  const context: IGitCipherEncryptContext = {
    catalogCacheFilepath: options.catalogCacheFilepath,
    encoding: options.encoding,
    filesOnly: options.filesOnly,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    secretFilepath: options.secretFilepath,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
    cryptPathResolver,
    plainPathResolver,
  }
  return context
}
