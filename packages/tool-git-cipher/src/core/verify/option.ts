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

interface ISubCommandOptions {
  /**
   * The path of catalog cache file of crypt repo. (relative of workspace)
   * @default '.ghc-cache-catalog.encrypt.json'
   */
  readonly catalogCacheFilepath: string
  /**
   * Crypt repo branch or commit id.
   */
  readonly cryptCommitId: string
  /**
   * Plain repo branch or commit id.
   */
  readonly plainCommitId: string | undefined
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandVerifyOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandVerifyOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  catalogCacheFilepath: '.ghc-cache-catalog.encrypt.json',
  cryptCommitId: 'HEAD',
  plainCommitId: undefined,
})

export function resolveSubCommandVerifyOptions(
  commandName: string,
  subCommandName: string,
  options: ISubCommandVerifyOptions,
): ISubCommandVerifyOptions {
  const baseOptions: ISubCommandVerifyOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandVerifyOptions,
    options,
  )

  // Resolve catalogCacheFilepath
  const catalogCacheFilepath: string = absoluteOfWorkspace(
    baseOptions.workspace,
    cover<string>(baseOptions.catalogCacheFilepath, options.catalogCacheFilepath, isNonBlankString),
  )
  logger.debug('catalogCacheFilepath:', catalogCacheFilepath)

  // Resolve cryptCommitId
  const cryptCommitId: string = cover<string>(
    baseOptions.cryptCommitId,
    options.cryptCommitId,
    isNonBlankString,
  )
  logger.debug('cryptCommitId:', cryptCommitId)

  // Resolve plainCommitId
  const plainCommitId: string | undefined = cover<string | undefined>(
    baseOptions.plainCommitId,
    options.plainCommitId,
    isNonBlankString,
  )
  logger.debug('plainCommitId:', plainCommitId)

  const resolvedOptions: ISubCommandOptions = {
    catalogCacheFilepath,
    cryptCommitId,
    plainCommitId,
  }
  return { ...baseOptions, ...resolvedOptions }
}
