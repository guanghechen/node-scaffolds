import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isNonBlankString } from '@guanghechen/helper-is'
import { cover } from '@guanghechen/helper-option'
import type { IReporter } from '@guanghechen/reporter.types'
import type { IGitCipherSubCommandOption } from '../_base'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions extends IGitCipherSubCommandOption {
  plainFilepath: string | undefined
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type IGitCipherCatOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandCatOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  plainFilepath: undefined,
})

export function resolveSubCommandCatOptions(
  commandName: string,
  subCommandName: string,
  args: string[],
  options: IGitCipherCatOptions,
  reporter: IReporter,
): IGitCipherCatOptions {
  const baseOptions: IGitCipherCatOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    args,
    options,
    reporter,
    getDefaultCommandCatOptions,
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
