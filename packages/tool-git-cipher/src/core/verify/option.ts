import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import { isNonBlankString } from '@guanghechen/helper-is'
import { cover } from '@guanghechen/helper-option'
import { logger } from '../../env/logger'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions {
  /**
   * Crypt repo branch or commit id.
   */
  readonly cryptCommitId: string
  /**
   * Plain repo branch or commit id.
   */
  readonly plainCommitId: string | undefined
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandVerifyOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandVerifyOptions = (): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(),
  cryptCommitId: 'HEAD',
  plainCommitId: undefined,
})

export function resolveSubCommandVerifyOptions(
  commandName: string,
  subCommandName: string,
  workspaceDir: string,
  options: ISubCommandVerifyOptions,
): ISubCommandVerifyOptions {
  const baseOptions: ISubCommandVerifyOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandVerifyOptions(),
    workspaceDir,
    options,
  )

  // Resolve cryptCommitId
  const cryptCommitId: string = cover<string>(
    baseOptions.cryptCommitId,
    options.cryptCommitId,
    isNonBlankString,
  )
  logger.debug('cryptCommitId:', cryptCommitId)

  // Resolve plainCommitId
  const plainCommitId: string | undefined = cover<string | undefined>(
    baseOptions.plainCommitId,
    options.plainCommitId,
    isNonBlankString,
  )
  logger.debug('plainCommitId:', plainCommitId)

  const resolvedOptions: ISubCommandOptions = { cryptCommitId, plainCommitId }
  return { ...baseOptions, ...resolvedOptions }
}
