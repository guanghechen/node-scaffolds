import type {
  ICommandConfigurationFlatOpts,
  ICommandConfigurationOptions,
} from '@guanghechen/helper-commander'
import { resolveCommandConfigurationOptions } from '@guanghechen/helper-commander'
import { isNonBlankString } from '@guanghechen/helper-is'
import { convertToBoolean, cover } from '@guanghechen/helper-option'
import { pathResolver } from '@guanghechen/path'
import { logger } from '../env/logger'

/**
 * Global command options
 */
export interface IGlobalCommandOptions extends ICommandConfigurationOptions {
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
export const __defaultGlobalCommandOptions: IGlobalCommandOptions = {
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
 * @returns
 */
export function resolveGlobalCommandOptions<O extends object>(
  commandName: string,
  subCommandName: string | false,
  defaultOptions: O,
  options: O & IGlobalCommandOptions,
): O & IGlobalCommandOptions & ICommandConfigurationFlatOpts {
  type R = O & IGlobalCommandOptions & ICommandConfigurationFlatOpts
  const baseOptions: R = resolveCommandConfigurationOptions<O & IGlobalCommandOptions>({
    logger,
    commandName,
    subCommandName,
    workspace: undefined,
    defaultOptions: { ...__defaultGlobalCommandOptions, ...defaultOptions },
    options,
  })
  const { workspace } = baseOptions

  // Resolve `encoding`.
  const encoding: string = cover<string>(baseOptions.encoding, options.encoding, isNonBlankString)
  logger.debug('encoding:', encoding)

  // Resolve `input`.
  const _input: string | undefined = cover<string | undefined>(
    baseOptions.input,
    options.input,
    isNonBlankString,
  )
  const input: string | undefined = _input ? pathResolver.safeResolve(workspace, _input) : undefined
  logger.debug('input:', input)

  // Resolve `output`.
  const _output: string | undefined = cover<string | undefined>(
    baseOptions.output,
    options.output,
    isNonBlankString,
  )
  const output: string | undefined = _output
    ? pathResolver.safeResolve(workspace, _output)
    : undefined
  logger.debug('output:', output)

  // resolve ciphertextRootDir
  const _fakeClipboard: string | undefined = cover<string | undefined>(
    baseOptions.fakeClipboard,
    options.fakeClipboard,
    isNonBlankString,
  )
  const fakeClipboard: string | undefined = _fakeClipboard
    ? pathResolver.safeResolve(workspace, _fakeClipboard)
    : undefined
  logger.debug('fakeClipboard:', fakeClipboard)

  // Resolve `force`.
  const force: boolean = cover<boolean>(baseOptions.force, convertToBoolean(options.force))
  logger.debug('force:', force)

  // Resolve `silence`.
  const silence: boolean = cover<boolean>(baseOptions.silence, convertToBoolean(options.silence))
  logger.debug('silence:', silence)

  // Resolve `stripAnsi`.
  const stripAnsi: boolean = cover<boolean>(
    baseOptions.stripAnsi,
    convertToBoolean(options.stripAnsi),
  )
  logger.debug('stripAnsi:', stripAnsi)

  return {
    ...baseOptions,
    encoding,
    input,
    output,
    fakeClipboard,
    force,
    silence,
    stripAnsi,
  }
}
