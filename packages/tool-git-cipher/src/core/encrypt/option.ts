import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isNonBlankString } from '@guanghechen/helper-is'
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
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandEncryptOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandEncryptOptions = (
  params: IResolveDefaultOptionsParams,
): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  catalogCacheFilepath: '.ghc-cache-catalog.encrypt.json',
})

export function resolveSubCommandEncryptOptions(
  commandName: string,
  subCommandName: string,
  workspaceDir: string,
  options: ISubCommandEncryptOptions,
): ISubCommandEncryptOptions {
  const baseOptions: ISubCommandEncryptOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandEncryptOptions,
    workspaceDir,
    options,
  )

  // Resolve catalogCacheFilepath
  const catalogCacheFilepath: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(baseOptions.catalogCacheFilepath, options.catalogCacheFilepath, isNonBlankString),
  )
  logger.debug('catalogCacheFilepath:', catalogCacheFilepath)

  const resolvedOptions: ISubCommandOptions = {
    catalogCacheFilepath,
  }
  return { ...baseOptions, ...resolvedOptions }
}
