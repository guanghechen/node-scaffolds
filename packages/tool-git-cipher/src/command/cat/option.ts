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
  plainPath: string | undefined
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type IGitCipherCatOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandCatOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  plainPath: undefined,
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
  const plainPath: string | undefined = cover<string | undefined>(
    baseOptions.plainPath,
    options.plainPath,
    isNonBlankString,
  )
  reporter.debug('plainPath:', plainPath)

  const resolvedOptions: ISubCommandOptions = { plainPath: plainPath }
  return { ...baseOptions, ...resolvedOptions }
}
