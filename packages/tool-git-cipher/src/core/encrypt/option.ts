import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isNonBlankString, isNotEmptyArray } from '@guanghechen/helper-is'
import { cover } from '@guanghechen/helper-option'
import { absoluteOfWorkspace } from '@guanghechen/helper-path'
import { logger } from '../../env/logger'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISubCommandOptions {
  /**
   * The path of catalog cache file of crypt repo. (relative of workspace)
   * @default '.ghc-cache-catalog.encrypt.json'
   */
  readonly catalogCacheFilepath: string
  /**
   * Specify files or directory path to commit.
   */
  readonly filesOnly: string[]
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandEncryptOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandEncryptOptions = (
  params: IResolveDefaultOptionsParams,
): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  catalogCacheFilepath: '.ghc-cache-catalog.encrypt.json',
  filesOnly: [],
})

export function resolveSubCommandEncryptOptions(
  commandName: string,
  subCommandName: string,
  options: ISubCommandEncryptOptions,
): ISubCommandEncryptOptions {
  const baseOptions: ISubCommandEncryptOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandEncryptOptions,
    options,
  )

  // Resolve catalogCacheFilepath
  const catalogCacheFilepath: string = absoluteOfWorkspace(
    baseOptions.workspace,
    cover<string>(baseOptions.catalogCacheFilepath, options.catalogCacheFilepath, isNonBlankString),
  )
  logger.debug('catalogCacheFilepath:', catalogCacheFilepath)

  // Resolve filesOnly
  const filesOnly: string[] = cover<string[]>(
    baseOptions.filesOnly,
    options.filesOnly,
    isNotEmptyArray,
  )
  logger.debug('filesOnly:', filesOnly)

  const resolvedOptions: ISubCommandOptions = {
    catalogCacheFilepath,
    filesOnly,
  }
  return { ...baseOptions, ...resolvedOptions }
}
