import type { IWorkspacePathResolver } from '@guanghechen/path'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import type { IGitCipherSubCommandContext } from '../_base'
import type { IGitCipherCatOptions } from './option'

export interface IGitCipherCatContext extends IGitCipherSubCommandContext {
  /**
   * Crypt workspace path resolver.
   */
  readonly cryptPathResolver: IWorkspacePathResolver
  /**
   * Default encoding of files in the workspace.
   */
  readonly encoding: string
  /**
   * Relative plain filepath.
   */
  readonly plainFilepath: string | undefined
  /**
   * Plain workspace path resolver.
   */
  readonly plainPathResolver: IWorkspacePathResolver
  /**
   * The path of secret file. (absolute path)
   */
  readonly secretFilepath: string
}

export async function createCatContextFromOptions(
  options: IGitCipherCatOptions,
): Promise<IGitCipherCatContext> {
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

  const context: IGitCipherCatContext = {
    cryptPathResolver,
    encoding: options.encoding,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    plainFilepath: options.plainFilepath,
    plainPathResolver,
    secretFilepath: options.secretFilepath,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
  }
  return context
}
