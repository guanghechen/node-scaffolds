import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import type { IReporter } from '@guanghechen/reporter.types'
import type { IToolFileSubCommandOption } from '../_base'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISubCommandOptions extends IToolFileSubCommandOption {}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type IToolFileMergeOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandMergeOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
})

export function resolveSubCommandMergeOptions(
  commandName: string,
  subCommandName: string,
  args: string[],
  options: IToolFileMergeOptions,
  reporter: IReporter,
): IToolFileMergeOptions {
  const baseOptions: IToolFileMergeOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    args,
    options,
    reporter,
    getDefaultCommandMergeOptions,
  )

  const resolvedOptions: ISubCommandOptions = {}
  return { ...baseOptions, ...resolvedOptions }
}
