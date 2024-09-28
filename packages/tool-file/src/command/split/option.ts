import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/commander'
import type { IReporter } from '@guanghechen/reporter'
import { convertToNumber, cover, parseBytesString } from '@guanghechen/std'
import type { IToolFileSubCommandOption } from '../_base'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions extends IToolFileSubCommandOption {
  readonly partSize: number | undefined
  readonly partTotal: number | undefined
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type IToolFileSplitOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandSplitOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  partSize: undefined,
  partTotal: undefined,
})

export function resolveSubCommandSplitOptions(
  commandName: string,
  subCommandName: string,
  args: string[],
  options: IToolFileSplitOptions,
  reporter: IReporter,
): IToolFileSplitOptions {
  const baseOptions: IToolFileSplitOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    args,
    options,
    reporter,
    getDefaultCommandSplitOptions,
  )

  // Resolve partSize.
  const partSize: number | undefined = cover<number | undefined>(
    baseOptions.partSize,
    parseBytesString((options.partSize as unknown as string) ?? ''),
    v => v !== undefined && v > 0,
  )
  reporter.debug('partSize:', partSize)

  // Resolve partTotal.
  const partTotal: number | undefined = cover<number | undefined>(
    baseOptions.partTotal,
    convertToNumber(options.partTotal),
    v => v !== undefined && v > 0,
  )
  reporter.debug('partTotal:', partTotal)

  const resolvedOptions: ISubCommandOptions = {
    partSize,
    partTotal,
  }
  return { ...baseOptions, ...resolvedOptions }
}
