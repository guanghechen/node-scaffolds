import type {
  ICommandConfigurationFlatOpts,
  ICommandConfigurationOptions,
  IResolveDefaultOptionsParams,
} from '@guanghechen/commander'
import { resolveCommandConfigurationOptions } from '@guanghechen/commander'
import type { IReporter } from '@guanghechen/reporter'
import { cover, coverString, isNonBlankString } from '@guanghechen/std'

// Global command options
export interface IGlobalCommandOptions extends ICommandConfigurationOptions {
  readonly output: string | undefined
  readonly partCodePrefix: string
  readonly reporter: IReporter
}

// Default value of global options
export const getDefaultGlobalCommandOptions = (
  params: IResolveDefaultOptionsParams,
): IGlobalCommandOptions => {
  const { reporter } = params
  return {
    logLevel: reporter.level,
    partCodePrefix: '.ghc-part',
    output: undefined,
    reporter,
  }
}

export function resolveBaseCommandOptions<O extends object>(
  commandName: string,
  subCommandName: string | false,
  _args: string[],
  options: O & IGlobalCommandOptions,
  reporter: IReporter,
  getDefaultOptions: (params: IResolveDefaultOptionsParams) => O,
): O & IGlobalCommandOptions & ICommandConfigurationFlatOpts {
  type R = O & IGlobalCommandOptions & ICommandConfigurationFlatOpts
  const baseOptions: R = resolveCommandConfigurationOptions<O & IGlobalCommandOptions>({
    reporter,
    commandName,
    subCommandName,
    workspace: undefined,
    defaultOptions: params => ({
      ...getDefaultGlobalCommandOptions(params),
      ...getDefaultOptions(params),
    }),
    options,
  })

  // Resolve output.
  const output: string | undefined = cover<string | undefined>(
    baseOptions.output,
    options.output,
    isNonBlankString,
  )
  reporter.debug('output:', output)

  // Resolve partCodePrefix.
  const partCodePrefix: string = coverString(
    baseOptions.partCodePrefix,
    options.partCodePrefix,
    isNonBlankString,
  )
  reporter.debug('partCodePrefix:', partCodePrefix)

  const resolvedOptions: IGlobalCommandOptions = {
    output,
    partCodePrefix,
    reporter,
  }
  return { ...baseOptions, ...resolvedOptions }
}
