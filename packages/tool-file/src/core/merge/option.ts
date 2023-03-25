import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISubCommandOptions {}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandMergeOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandMergeOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
})

export function resolveSubCommandMergeOptions(
  commandName: string,
  subCommandName: string,
  options: ISubCommandMergeOptions,
): ISubCommandMergeOptions {
  const baseOptions: ISubCommandMergeOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandMergeOptions,
    options,
  )

  const resolvedOptions: ISubCommandOptions = {}
  return { ...baseOptions, ...resolvedOptions }
}
