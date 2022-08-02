import type {
  CommandConfigurationFlatOpts,
  CommandConfigurationOptions,
  MergeStrategy,
} from '@guanghechen/commander-helper'
import { resolveCommandConfigurationOptions } from '@guanghechen/commander-helper'
import { absoluteOfWorkspace } from '@guanghechen/file-helper'
import { isNonBlankString } from '@guanghechen/helper-is'
import { convertToBoolean, cover } from '@guanghechen/helper-option'
import { logger } from '../env/logger'

/**
 * Global command options
 */
export interface GlobalCommandOptions extends CommandConfigurationOptions {
  /**
   * Encoding of content from stdin or file.
   * @default utf8
   */
  encoding: BufferEncoding
  /**
   * Read data from file stead of stdin.
   */
  input?: string
  /**
   * Output the content to file instead of stdout.
   */
  output?: string
  /**
   * Filepath of the fake clipboard.
   */
  fakeClipboard?: string
  /**
   * Force override content into the output file.
   * @default false
   */
  force: boolean
  /**
   * Don't print info-level log.
   * @default false
   */
  silence: boolean
  /**
   * Whether to strip ansi escape codes (i.e. terminal colors).
   * @default false
   */
  stripAnsi: boolean
}

/**
 * Default value of global options
 */
export const __defaultGlobalCommandOptions: GlobalCommandOptions = {
  encoding: 'utf8',
  input: undefined,
  output: undefined,
  fakeClipboard: undefined,
  force: false,
  silence: false,
  stripAnsi: false,
}

/**
 *
 * @param commandName
 * @param subCommandName
 * @param defaultOptions
 * @param workspaceDir
 * @param options
 * @param strategies
 * @returns
 */
export function resolveGlobalCommandOptions<C extends Record<string, unknown>>(
  commandName: string,
  subCommandName: string | false,
  defaultOptions: C,
  workspaceDir: string,
  options: C & GlobalCommandOptions,
  strategies: Partial<Record<keyof (C & GlobalCommandOptions), MergeStrategy>> = {},
): C & GlobalCommandOptions & CommandConfigurationFlatOpts {
  type R = C & GlobalCommandOptions & CommandConfigurationFlatOpts
  const resolvedDefaultOptions: R = resolveCommandConfigurationOptions<
    C & GlobalCommandOptions,
    C & GlobalCommandOptions
  >(
    logger,
    commandName,
    subCommandName,
    workspaceDir,
    { ...__defaultGlobalCommandOptions, ...defaultOptions },
    options,
    strategies,
  )

  // Resolve `encoding`.
  const encoding: string = cover<string>(
    resolvedDefaultOptions.encoding,
    options.encoding,
    isNonBlankString,
  )
  logger.debug('encoding:', encoding)

  // Resolve `input`.
  const _input: string | undefined = cover<string | undefined>(
    resolvedDefaultOptions.input,
    options.input,
    isNonBlankString,
  )
  const input: string | undefined = _input ? absoluteOfWorkspace(workspaceDir, _input) : undefined
  logger.debug('input:', input)

  // Resolve `output`.
  const _output: string | undefined = cover<string | undefined>(
    resolvedDefaultOptions.output,
    options.output,
    isNonBlankString,
  )
  const output: string | undefined = _output
    ? absoluteOfWorkspace(workspaceDir, _output)
    : undefined
  logger.debug('output:', output)

  // resolve ciphertextRootDir
  const _fakeClipboard: string | undefined = cover<string | undefined>(
    resolvedDefaultOptions.fakeClipboard,
    options.fakeClipboard,
    isNonBlankString,
  )
  const fakeClipboard: string | undefined = _fakeClipboard
    ? absoluteOfWorkspace(workspaceDir, _fakeClipboard)
    : undefined
  logger.debug('fakeClipboard:', fakeClipboard)

  // Resolve `force`.
  const force: boolean = cover<boolean>(
    resolvedDefaultOptions.force,
    convertToBoolean(options.force),
  )
  logger.debug('force:', force)

  // Resolve `silence`.
  const silence: boolean = cover<boolean>(
    resolvedDefaultOptions.silence,
    convertToBoolean(options.silence),
  )
  logger.debug('silence:', silence)

  // Resolve `stripAnsi`.
  const stripAnsi: boolean = cover<boolean>(
    resolvedDefaultOptions.stripAnsi,
    convertToBoolean(options.stripAnsi),
  )
  logger.debug('stripAnsi:', stripAnsi)

  return {
    ...resolvedDefaultOptions,
    encoding,
    input,
    output,
    fakeClipboard,
    force,
    silence,
    stripAnsi,
  }
}
