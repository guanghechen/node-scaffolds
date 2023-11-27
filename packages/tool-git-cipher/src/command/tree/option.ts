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
  /**
   * Crypt repo branch or commit id.
   */
  readonly filesAt: string
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandTreeOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandTreeOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  filesAt: 'HEAD',
})

export function resolveSubCommandTreeOptions(
  commandName: string,
  subCommandName: string,
  options: ISubCommandTreeOptions,
): ISubCommandTreeOptions {
  const baseOptions: ISubCommandTreeOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandTreeOptions,
    options,
  )

  // Resolve filesAt
  const filesAt: string = cover<string>(baseOptions.filesAt, options.filesAt, isNonBlankString)
  reporter.debug('filesAt:', filesAt)

  const resolvedOptions: ISubCommandOptions = { filesAt }
  return { ...baseOptions, ...resolvedOptions }
}
