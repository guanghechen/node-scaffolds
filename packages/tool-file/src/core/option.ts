import type {
  ICommandConfigurationFlatOpts,
  ICommandConfigurationOptions,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { resolveCommandConfigurationOptions } from '@guanghechen/helper-commander'
import { parseBytesString } from '@guanghechen/helper-func'
import { isNonBlankString } from '@guanghechen/helper-is'
import { convertToNumber, cover, coverString } from '@guanghechen/helper-option'
import { logger } from '../env/logger'

// Global command options
export interface IGlobalCommandOptions extends ICommandConfigurationOptions {
  readonly partCodePrefix: string
  readonly partSize: number | undefined
  readonly partTotal: number | undefined
}

// Default value of global options
export const getDefaultGlobalCommandOptions = (
  _params: IResolveDefaultOptionsParams,
): IGlobalCommandOptions => ({
  logLevel: logger.level,
  partCodePrefix: '.ghc-part',
  partSize: undefined,
  partTotal: undefined,
})

export function resolveBaseCommandOptions<O extends object>(
  commandName: string,
  subCommandName: string | false,
  getDefaultOptions: (params: IResolveDefaultOptionsParams) => O,
  options: O & IGlobalCommandOptions,
): O & IGlobalCommandOptions & ICommandConfigurationFlatOpts {
  type R = O & IGlobalCommandOptions & ICommandConfigurationFlatOpts
  const baseOptions: R = resolveCommandConfigurationOptions<O & IGlobalCommandOptions>({
    logger,
    commandName,
    subCommandName,
    workspace: undefined,
    defaultOptions: params => ({
      ...getDefaultGlobalCommandOptions(params),
      ...getDefaultOptions(params),
    }),
    options,
  })

  // Resolve partCodePrefix.
  const partCodePrefix: string = coverString(
    baseOptions.partCodePrefix,
    options.partCodePrefix,
    isNonBlankString,
  )
  logger.debug('partCodePrefix:', partCodePrefix)

  // Resolve partSize.
  const partSize: number | undefined = cover<number | undefined>(
    baseOptions.partSize,
    parseBytesString((options.partSize as unknown as string) ?? ''),
    v => v !== undefined && v > 0,
  )
  logger.debug('partSize:', partSize)

  // Resolve partTotal.
  const partTotal: number | undefined = cover<number | undefined>(
    baseOptions.partTotal,
    convertToNumber(options.partTotal),
    v => v !== undefined && v > 0,
  )
  logger.debug('partTotal:', partTotal)

  const resolvedOptions: IGlobalCommandOptions = {
    partCodePrefix,
    partSize,
    partTotal,
  }
  return { ...baseOptions, ...resolvedOptions }
}
