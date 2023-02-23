import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import { isNonBlankString } from '@guanghechen/helper-is'
import { cover } from '@guanghechen/helper-option'
import { logger } from '../../env/logger'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions {
  /**
   * Git branch or commit id.
   */
  readonly commitId: string
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandCatOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandCatOptions = (): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(),
  commitId: 'HEAD',
})

export function resolveSubCommandCatOptions(
  commandName: string,
  subCommandName: string,
  workspaceDir: string,
  options: ISubCommandCatOptions,
): ISubCommandCatOptions {
  const baseOptions: ISubCommandCatOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandCatOptions(),
    workspaceDir,
    options,
  )

  // Resolve commitId
  const commitId: string = cover<string>(baseOptions.commitId, options.commitId, isNonBlankString)
  logger.debug('commitId:', commitId)

  const resolvedOptions: ISubCommandOptions = { commitId }
  return { ...baseOptions, ...resolvedOptions }
}
