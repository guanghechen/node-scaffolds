import type { IWorkspacePathResolver } from '@guanghechen/path'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import type { IGitCipherSubCommandContext } from '../_base'
import type { IGitCipherEncryptOptions } from './option'

export interface IGitCipherEncryptContext extends IGitCipherSubCommandContext {
  /**
   * The path of catalog cache file of crypt repo. (absolute path)
   */
  readonly catalogCacheFilepath: string
  /**
   * Crypt workspace path resolver.
   */
  readonly cryptPathResolver: IWorkspacePathResolver
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
   * Plain workspace path resolver.
   */
  readonly plainPathResolver: IWorkspacePathResolver
  /**
   * The path of secret file. (absolute path)
   */
  readonly secretFilepath: string
}

export async function createEncryptContextFromOptions(
  options: IGitCipherEncryptOptions,
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
    cryptPathResolver,
    encoding: options.encoding,
    filesOnly: options.filesOnly,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    plainPathResolver,
    secretFilepath: options.secretFilepath,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
  }
  return context
}
