import type {
  ICommandConfigurationFlatOpts,
  ICommandConfigurationOptions,
} from '@guanghechen/helper-commander'
import { resolveCommandConfigurationOptions } from '@guanghechen/helper-commander'
import { isNonBlankString } from '@guanghechen/helper-is'
import { convertToBoolean, convertToNumber, cover } from '@guanghechen/helper-option'
import { absoluteOfWorkspace } from '@guanghechen/helper-path'
import { logger } from '../env/logger'

/**
 * Global command options
 */
export interface IGlobalCommandOptions extends ICommandConfigurationOptions {
  /**
   * The directory where the crypt repo located. (relative of workspace or absolute path)
   * @default 'ghc-crypt'
   */
  readonly cryptRootDir: string
  /**
   * Default encoding of files in the workspace.
   * @default 'utf8'
   */
  readonly encoding: BufferEncoding
  /**
   * The maximum size required of password.
   * @default 100
   */
  readonly maxPasswordLength: number
  /**
   * max wrong password retry times.
   */
  readonly maxRetryTimes: number
  /**
   * The minimum size required of password.
   * @default 6
   */
  readonly minPasswordLength: number
  /**
   * The directory where the plain repo located. (relative of workspace or absolute path)
   * @default '.'
   */
  readonly plainRootDir: string
  /**
   * The path of secret file. (relative of workspace)
   * @default '.ghc-secret'
   */
  readonly secretFilepath: string
  /**
   * Whether to print password asterisks.
   * @default true
   */
  readonly showAsterisk: boolean
}

/**
 * Default value of global options
 */
export const getDefaultGlobalCommandOptions = (): IGlobalCommandOptions => ({
  logLevel: 'info',
  configPath: ['.ghc-config.json'],
  cryptRootDir: 'ghc-crypt',
  encoding: 'utf8',
  maxPasswordLength: 100,
  maxRetryTimes: 3,
  minPasswordLength: 6,
  plainRootDir: '.',
  secretFilepath: '.ghc-secret.json',
  showAsterisk: true,
})

/**
 * @param commandName
 * @param subCommandName
 * @param defaultOptions
 * @param workspaceDir
 * @param options
 */
export function resolveBaseCommandOptions<C extends object>(
  commandName: string,
  subCommandName: string | false,
  defaultOptions: C,
  workspaceDir: string,
  options: C & IGlobalCommandOptions,
): C & IGlobalCommandOptions & ICommandConfigurationFlatOpts {
  type R = C & IGlobalCommandOptions & ICommandConfigurationFlatOpts
  const resolvedDefaultOptions: R = resolveCommandConfigurationOptions<C & IGlobalCommandOptions>(
    logger,
    commandName,
    subCommandName,
    workspaceDir,
    { ...getDefaultGlobalCommandOptions(), ...defaultOptions },
    options,
  )

  // Resolve cryptRootDir
  const cryptRootDir: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(resolvedDefaultOptions.cryptRootDir, options.cryptRootDir, isNonBlankString),
  )
  logger.debug('cryptRootDir:', cryptRootDir)

  // Resolve encoding
  const encoding: BufferEncoding = cover<BufferEncoding>(
    resolvedDefaultOptions.encoding,
    options.encoding,
    isNonBlankString,
  )
  logger.debug('encoding:', encoding)

  // Resolve maxPasswordLength
  const maxPasswordLength: number = cover<number>(
    resolvedDefaultOptions.maxPasswordLength,
    convertToNumber(options.maxPasswordLength),
  )
  logger.debug('maxPasswordLength:', maxPasswordLength)

  // Resolve maxRetryTimes
  const maxRetryTimes: number = cover<number>(
    resolvedDefaultOptions.maxRetryTimes,
    convertToNumber(options.maxRetryTimes),
  )
  logger.debug('maxRetryTimes:', maxRetryTimes)

  // Resolve minPasswordLength
  const minPasswordLength: number = cover<number>(
    resolvedDefaultOptions.minPasswordLength,
    convertToNumber(options.minPasswordLength),
  )
  logger.debug('minPasswordLength:', minPasswordLength)

  // Resolve plainRootDir
  const plainRootDir: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(resolvedDefaultOptions.plainRootDir, options.plainRootDir, isNonBlankString),
  )
  logger.debug('plainRootDir:', plainRootDir)

  // Resolve secretFilepath
  const secretFilepath: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(resolvedDefaultOptions.secretFilepath, options.secretFilepath, isNonBlankString),
  )
  logger.debug('secretFilepath:', secretFilepath)

  // Resolve showAsterisk
  const showAsterisk: boolean = cover<boolean>(
    resolvedDefaultOptions.showAsterisk,
    convertToBoolean(options.showAsterisk),
  )
  logger.debug('showAsterisk:', showAsterisk)

  const resolvedOptions: IGlobalCommandOptions = {
    cryptRootDir,
    encoding,
    maxPasswordLength,
    maxRetryTimes,
    minPasswordLength,
    plainRootDir,
    secretFilepath,
    showAsterisk,
  }

  return { ...resolvedDefaultOptions, ...resolvedOptions }
}
