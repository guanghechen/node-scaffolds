import type { IWorkspacePathResolver } from '@guanghechen/path'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import type { IGitCipherSubCommandContext } from '../_base'
import type { IGitCipherDecryptOption } from './option'

export interface IGitCipherDecryptContext extends IGitCipherSubCommandContext {
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
   * Plain workspace path resolver.
   */
  readonly plainPathResolver: IWorkspacePathResolver
  /**
   * The path of secret file. (absolute path)
   */
  readonly secretFilepath: string
}

export async function createDecryptContextFromOptions(
  options: IGitCipherDecryptOption,
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
    cryptPathResolver,
    encoding: options.encoding,
    filesAt: options.filesAt,
    filesOnly: options.filesOnly,
    gitGpgSign: options.gitGpgSign,
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
