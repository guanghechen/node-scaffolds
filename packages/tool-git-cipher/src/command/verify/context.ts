import type { IWorkspacePathResolver } from '@guanghechen/path'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import type { IGitCipherSubCommandContext } from '../_base'
import type { IGitCipherVerifyOptions } from './option'

export interface IGitCipherVerifyContext extends IGitCipherSubCommandContext {
  /**
   * The path of catalog cache file of crypt repo. (absolute path)
   */
  readonly catalogCachePath: string
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
   * Plain repo branch or commit id.
   */
  readonly plainCommitId: string | undefined
  /**
   * Plain workspace path resolver.
   */
  readonly plainPathResolver: IWorkspacePathResolver
  /**
   * The path of secret file. (absolute path)
   */
  readonly secretConfigPath: string
}

export async function createVerifyContextFromOptions(
  options: IGitCipherVerifyOptions,
): Promise<IGitCipherVerifyContext> {
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

  const context: IGitCipherVerifyContext = {
    catalogCachePath: options.catalogCachePath,
    cryptCommitId: options.cryptCommitId,
    cryptPathResolver,
    encoding: options.encoding,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    plainCommitId: options.plainCommitId,
    plainPathResolver,
    secretConfigPath: options.secretConfigPath,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
  }
  return context
}
