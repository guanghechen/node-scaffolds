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
   * default encoding of files in the workspace
   * @default utf-8
   */
  encoding: BufferEncoding
  /**
   * path of secret file
   * @default '.ghc-secret'
   */
  secretFilepath: string
  /**
   * path of index file of ciphertext files
   * @default '.ghc-index'
   */
  indexFilepath: string
  /**
   * Encoding of ciphered index file
   * @default 'base64'
   */
  cipheredIndexEncoding: BufferEncoding
  /**
   * the directory where the encrypted files are stored
   * @default ghc-ciphertext
   */
  ciphertextRootDir: string
  /**
   * the directory where the source plaintext files are stored
   * @default ghc-plaintext
   */
  plaintextRootDir: string
  /**
   * whether to print password asterisks
   * @default true
   */
  showAsterisk: boolean
  /**
   * the minimum size required of password
   * @default 6
   */
  minPasswordLength: number
  /**
   * the maximum size required of password
   * @default 100
   */
  maxPasswordLength: number
  /**
   * Max size (byte) of target file, once the file size exceeds this value,
   * the target file is split into multiple files.
   */
  readonly maxTargetFileSize?: number
}

/**
 * Default value of global options
 */
export const getDefaultGlobalCommandOptions = (): IGlobalCommandOptions => ({
  encoding: 'utf8',
  secretFilepath: '.ghc-secret',
  indexFilepath: '.ghc-index',
  cipheredIndexEncoding: 'base64',
  ciphertextRootDir: 'ghc-ciphertext',
  plaintextRootDir: 'ghc-plaintext',
  showAsterisk: true,
  minPasswordLength: 6,
  maxPasswordLength: 100,
  maxTargetFileSize: undefined,
})

/**
 * @param commandName
 * @param subCommandName
 * @param defaultOptions
 * @param workspaceDir
 * @param options
 */
export function resolveGlobalCommandOptions<C extends object>(
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

  // resolve encoding
  const encoding: string = cover<string>(
    resolvedDefaultOptions.encoding,
    options.encoding,
    isNonBlankString,
  )
  logger.debug('encoding:', encoding)

  // resolve secretFilepath
  const secretFilepath: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(
      resolvedDefaultOptions.secretFilepath,
      options.secretFilepath,
      isNonBlankString,
    ) as string,
  )
  logger.debug('secretFilepath:', secretFilepath)

  // resolve indexFilepath
  const indexFilepath: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(
      resolvedDefaultOptions.indexFilepath,
      options.indexFilepath,
      isNonBlankString,
    ) as string,
  )
  logger.debug('indexFilepath:', indexFilepath)

  // resolve cipheredIndexEncoding
  const cipheredIndexEncoding: string = cover<string>(
    resolvedDefaultOptions.cipheredIndexEncoding,
    options.cipheredIndexEncoding,
    isNonBlankString,
  )
  logger.debug('cipheredIndexEncoding:', cipheredIndexEncoding)

  // resolve ciphertextRootDir
  const ciphertextRootDir: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(
      resolvedDefaultOptions.ciphertextRootDir,
      options.ciphertextRootDir,
      isNonBlankString,
    ) as string,
  )
  logger.debug('ciphertextRootDir:', ciphertextRootDir)

  // resolve plaintextRootDir
  const plaintextRootDir: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(
      resolvedDefaultOptions.plaintextRootDir,
      options.plaintextRootDir,
      isNonBlankString,
    ) as string,
  )
  logger.debug('plaintextRootDir:', plaintextRootDir)

  // resolve showAsterisk
  const showAsterisk: boolean = cover<boolean>(
    resolvedDefaultOptions.showAsterisk,
    convertToBoolean(options.showAsterisk),
  )
  logger.debug('showAsterisk:', showAsterisk)

  // resolve minPasswordLength
  const minPasswordLength: number = cover<number>(
    resolvedDefaultOptions.minPasswordLength,
    convertToNumber(options.minPasswordLength),
  )
  logger.debug('minPasswordLength:', minPasswordLength)

  // resolve maxPasswordLength
  const maxPasswordLength: number = cover<number>(
    resolvedDefaultOptions.maxPasswordLength,
    convertToNumber(options.maxPasswordLength),
  )
  logger.debug('maxPasswordLength:', maxPasswordLength)

  // resolve maxTargetFileSize
  const maxTargetFileSize: number | undefined = cover<number | undefined>(
    resolvedDefaultOptions.maxTargetFileSize,
    convertToNumber(options.maxTargetFileSize),
  )
  logger.debug('maxTargetFileSize:', maxTargetFileSize)

  return {
    ...resolvedDefaultOptions,
    encoding,
    secretFilepath,
    indexFilepath,
    cipheredIndexEncoding,
    ciphertextRootDir,
    plaintextRootDir,
    showAsterisk,
    minPasswordLength,
    maxPasswordLength,
    maxTargetFileSize,
  }
}
