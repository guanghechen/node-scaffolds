import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isNonBlankString } from '@guanghechen/helper-is'
import { cover } from '@guanghechen/helper-option'
import type { IGitCipherSubCommandOption } from '../_base'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions extends IGitCipherSubCommandOption {
  /**
   * Crypt repo branch or commit id.
   */
  readonly filesAt: string
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type IGitCipherTreeOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandTreeOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  filesAt: 'HEAD',
})

export function resolveSubCommandTreeOptions(
  commandName: string,
  subCommandName: string,
  options: IGitCipherTreeOptions,
): IGitCipherTreeOptions {
  const baseOptions: IGitCipherTreeOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandTreeOptions,
    options,
  )
  const { reporter } = baseOptions

  // Resolve filesAt
  const filesAt: string = cover<string>(baseOptions.filesAt, options.filesAt, isNonBlankString)
  reporter.debug('filesAt:', filesAt)

  const resolvedOptions: ISubCommandOptions = { filesAt }
  return { ...baseOptions, ...resolvedOptions }
}
