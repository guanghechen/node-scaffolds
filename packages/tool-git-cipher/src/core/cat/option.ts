import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isNonBlankString } from '@guanghechen/helper-is'
import { cover } from '@guanghechen/helper-option'
import { logger } from '../../env/logger'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions {
  /**
   * Crypt repo branch or commit id.
   */
  readonly cryptCommitId: string
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandCatOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandCatOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  cryptCommitId: 'HEAD',
})

export function resolveSubCommandCatOptions(
  commandName: string,
  subCommandName: string,
  workspaceDir: string,
  options: ISubCommandCatOptions,
): ISubCommandCatOptions {
  const baseOptions: ISubCommandCatOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandCatOptions,
    workspaceDir,
    options,
  )

  // Resolve cryptCommitId
  const cryptCommitId: string = cover<string>(
    baseOptions.cryptCommitId,
    options.cryptCommitId,
    isNonBlankString,
  )
  logger.debug('cryptCommitId:', cryptCommitId)

  const resolvedOptions: ISubCommandOptions = { cryptCommitId }
  return { ...baseOptions, ...resolvedOptions }
}
