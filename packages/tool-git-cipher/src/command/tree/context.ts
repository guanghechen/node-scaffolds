import type { IWorkspacePathResolver } from '@guanghechen/path'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import type { IReporter } from '@guanghechen/reporter.types'
import { reporter } from '../../shared/core/reporter'
import type { ISubCommandTreeOptions } from './option'

export interface IGitCipherTreeContext {
  /**
   * Crypt repo branch or commit id.
   */
  readonly cryptCommitId: string
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
  /**
   * Crypt workspace path resolver.
   */
  readonly cryptPathResolver: IWorkspacePathResolver
  /**
   * Reporter to log debug/verbose/info/warn/error messages.
   */
  readonly reporter: IReporter
}

export async function createTreeContextFromOptions(
  options: ISubCommandTreeOptions,
): Promise<IGitCipherTreeContext> {
  const cryptRootDir: string = options.cryptRootDir
  const cryptPathResolver: IWorkspacePathResolver = new WorkspacePathResolver(
    cryptRootDir,
    pathResolver,
  )

  const context: IGitCipherTreeContext = {
    cryptCommitId: options.filesAt,
    encoding: options.encoding,
    maxPasswordLength: options.maxPasswordLength,
    maxRetryTimes: options.maxRetryTimes,
    minPasswordLength: options.minPasswordLength,
    secretFilepath: options.secretFilepath,
    showAsterisk: options.showAsterisk,
    workspace: options.workspace,
    cryptPathResolver,
    reporter,
  }
  return context
}
