import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { parseBytesString } from '@guanghechen/helper-func'
import { convertToNumber, cover } from '@guanghechen/helper-option'
import { reporter } from '../../env/reporter'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISubCommandOptions {
  readonly partSize: number | undefined
  readonly partTotal: number | undefined
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandSplitOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandSplitOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  partSize: undefined,
  partTotal: undefined,
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
