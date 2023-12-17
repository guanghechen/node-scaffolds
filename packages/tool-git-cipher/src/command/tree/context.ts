import type { IWorkspacePathResolver } from '@guanghechen/path'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import type { IGitCipherSubCommandContext } from '../_base'
import type { IGitCipherTreeOptions } from './option'

export interface IGitCipherTreeContext extends IGitCipherSubCommandContext {
  /**
   * Crypt repo branch or commit id.
   */
  readonly cryptCommitId: string
  /**
   * Crypt workspace path resolver.
   */
  readonly cryptPathResolver: IWorkspacePathResolver
  /**
   * Default encoding of files in the workspace.
   */
  readonly encoding: string
  /**
   * Plain workspace path resolver.
   */
  readonly plainPathResolver: IWorkspacePathResolver
  /**
   * The path of secret file. (absolute path)
   */
  readonly secretFilepath: string
}

export async function createTreeContextFromOptions(
  options: IGitCipherTreeOptions,
): Promise<IGitCipherTreeContext> {
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

  const context: IGitCipherTreeContext = {
    cryptCommitId: options.filesAt,
    cryptPathResolver,
    encoding: options.encoding,
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
