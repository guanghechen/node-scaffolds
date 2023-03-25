import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISubCommandOptions {}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandSplitOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandSplitOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
})

export function resolveSubCommandSplitOptions(
  commandName: string,
  subCommandName: string,
  options: ISubCommandSplitOptions,
): ISubCommandSplitOptions {
  const baseOptions: ISubCommandSplitOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandSplitOptions,
    options,
  )

  const resolvedOptions: ISubCommandOptions = {}
  return { ...baseOptions, ...resolvedOptions }
}
