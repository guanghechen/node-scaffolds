import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isNonBlankString } from '@guanghechen/helper-is'
import { cover } from '@guanghechen/helper-option'
import { reporter } from '../../shared/core/reporter'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions {
  plainFilepath: string | undefined
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandCatOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandCatOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  plainFilepath: undefined,
})

export function resolveSubCommandCatOptions(
  commandName: string,
  subCommandName: string,
  options: ISubCommandCatOptions,
): ISubCommandCatOptions {
  const baseOptions: ISubCommandCatOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandCatOptions,
    options,
  )

  // Resolve plainFilepath
  const plainFilepath: string | undefined = cover<string | undefined>(
    baseOptions.plainFilepath,
    options.plainFilepath,
    isNonBlankString,
  )
  reporter.debug('plainFilepath:', plainFilepath)

  const resolvedOptions: ISubCommandOptions = { plainFilepath }
  return { ...baseOptions, ...resolvedOptions }
}
