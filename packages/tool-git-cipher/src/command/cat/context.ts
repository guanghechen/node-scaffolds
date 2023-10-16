import type { IWorkspacePathResolver } from '@guanghechen/path'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import type { ISubCommandCatOptions } from './option'

export interface IGitCipherCatContext {
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
   * Relative plain filepath.
   */
  readonly plainFilepath: string | undefined
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

export async function createCatContextFromOptions(
  options: ISubCommandCatOptions,
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
    encoding: options.encoding,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    plainFilepath: options.plainFilepath,
    secretFilepath: options.secretFilepath,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
    cryptPathResolver,
    plainPathResolver,
  }
  return context
}
