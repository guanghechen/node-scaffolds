import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isBoolean, isNonBlankString } from '@guanghechen/helper-is'
import { cover } from '@guanghechen/helper-option'
import { pathResolver } from '@guanghechen/path'
import type { IGitCipherSubCommandOption } from '../_base'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISubCommandOptions extends IGitCipherSubCommandOption {
  /**
   * The path of catalog cache file of crypt repo. (relative of workspace)
   * @default '.ghc-cache-catalog.encrypt.json'
   */
  readonly catalogCacheFilepath: string
  /**
   * Determines whether `plainRootDir` represents the root directory of source files
   * or the root directory of a git repository containing the source files.
   *
   * - true: the `plainRootDir` is the root directory of some source files.
   * - false: the `plainRootDir` is the root directory of the git repo where the source files located.
   */
  readonly filesOnly: boolean
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type IGitCipherEncryptOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandEncryptOptions = (
  params: IResolveDefaultOptionsParams,
): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  catalogCacheFilepath: '.ghc-cache-catalog.encrypt.json',
  filesOnly: false,
})

export function resolveSubCommandEncryptOptions(
  commandName: string,
  subCommandName: string,
  options: IGitCipherEncryptOptions,
): IGitCipherEncryptOptions {
  const baseOptions: IGitCipherEncryptOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandEncryptOptions,
    options,
  )
  const { reporter } = baseOptions

  // Resolve catalogCacheFilepath
  const catalogCacheFilepath: string = pathResolver.safeResolve(
    baseOptions.workspace,
    cover<string>(baseOptions.catalogCacheFilepath, options.catalogCacheFilepath, isNonBlankString),
  )
  reporter.debug('catalogCacheFilepath:', catalogCacheFilepath)

  // Resolve filesOnly
  const filesOnly: boolean = cover<boolean>(baseOptions.filesOnly, options.filesOnly, isBoolean)
  reporter.debug('filesOnly:', filesOnly)

  const resolvedOptions: ISubCommandOptions = {
    catalogCacheFilepath,
    filesOnly,
  }
  return { ...baseOptions, ...resolvedOptions }
}
