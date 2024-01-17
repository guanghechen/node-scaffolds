import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isBoolean, isNonBlankString } from '@guanghechen/helper-is'
import { cover } from '@guanghechen/helper-option'
import { pathResolver } from '@guanghechen/path'
import type { IReporter } from '@guanghechen/reporter.types'
import type { IGitCipherSubCommandOption } from '../_base'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISubCommandOptions extends IGitCipherSubCommandOption {
  /**
   * The path of catalog cache file of crypt repo. (relative of workspace)
   * @default '.ghc-catalog.cache.encrypt.json'
   */
  readonly catalogCachePath: string
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
  catalogCachePath: '.ghc-catalog.cache.encrypt.json',
  filesOnly: false,
})

export function resolveSubCommandEncryptOptions(
  commandName: string,
  subCommandName: string,
  args: string[],
  options: IGitCipherEncryptOptions,
  reporter: IReporter,
): IGitCipherEncryptOptions {
  const baseOptions: IGitCipherEncryptOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    args,
    options,
    reporter,
    getDefaultCommandEncryptOptions,
  )

  // Resolve catalogCachePath
  const catalogCachePath: string = pathResolver.safeResolve(
    baseOptions.workspace,
    cover<string>(baseOptions.catalogCachePath, options.catalogCachePath, isNonBlankString),
  )
  reporter.debug('catalogCachePath:', catalogCachePath)

  // Resolve filesOnly
  const filesOnly: boolean = cover<boolean>(baseOptions.filesOnly, options.filesOnly, isBoolean)
  reporter.debug('filesOnly:', filesOnly)

  const resolvedOptions: ISubCommandOptions = {
    catalogCachePath,
    filesOnly,
  }
  return { ...baseOptions, ...resolvedOptions }
}
