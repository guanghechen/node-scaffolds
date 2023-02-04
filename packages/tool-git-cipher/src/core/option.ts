import type { IPBKDF2Options } from '@guanghechen/helper-cipher'
import type {
  ICommandConfigurationFlatOpts,
  ICommandConfigurationOptions,
} from '@guanghechen/helper-commander'
import { resolveCommandConfigurationOptions } from '@guanghechen/helper-commander'
import { isNonBlankString } from '@guanghechen/helper-is'
import { convertToBoolean, convertToNumber, cover } from '@guanghechen/helper-option'
import { absoluteOfWorkspace } from '@guanghechen/helper-path'
import type { BinaryLike } from 'crypto'
import { logger } from '../env/logger'

/**
 * Global command options
 */
export interface IGlobalCommandOptions extends ICommandConfigurationOptions {
  /**
   * Default encoding of files in the workspace
   * @default 'utf8'
   */
  readonly encoding: BufferEncoding
  /**
   * Options for PBKDF2 algorithm.
   */
  readonly pbkdf2Options: IPBKDF2Options
  /**
   * The path of secret file.
   * @default '.ghc-secret'
   */
  readonly secretFilepath: string
  /**
   * The path of catalog file of crypt repo.
   * @default '.ghc-catalog'
   */
  readonly catalogFilepath: string
  /**
   * The directory where the crypt repo located.
   * @default 'ghc-crypt'
   */
  readonly cryptRootDir: string
  /**
   * A relative path of cryptRootDir, where the encrypted files located.
   * @default 'encrypted'
   */
  readonly encryptedFilesDir: string
  /**
   * Salt for generate encrypted file path.
   * @default 'encrypted_path_salt'
   */
  readonly encryptedFilePathSalt: string
  /**
   * Whether to print password asterisks
   * @default true
   */
  readonly showAsterisk: boolean
  /**
   * The minimum size required of password
   * @default 6
   */
  readonly minPasswordLength: number
  /**
   * The maximum size required of password
   * @default 100
   */
  readonly maxPasswordLength: number
  /**
   * Max size (byte) of target file, once the file size exceeds this value,
   * the target file is split into multiple files.
   */
  readonly maxTargetFileSize?: number
  /**
   * Prefix of parts code.
   * @default '.ghc-part'
   */
  readonly partCodePrefix: string
  /**
   * Glob patterns indicated which files should be keepPlain.
   * @default []
   */
  readonly keepPlainPatterns: string[]
}

/**
 * Default value of global options
 */
export const getDefaultGlobalCommandOptions = (): IGlobalCommandOptions => ({
  encoding: 'utf8',
  pbkdf2Options: {
    salt: 'guanghechen',
    iterations: 100000,
    keylen: 32,
    digest: 'sha256',
  },
  secretFilepath: '.ghc-secret',
  catalogFilepath: '.ghc-catalog',
  cryptRootDir: 'ghc-crypt',
  encryptedFilesDir: 'encrypted',
  encryptedFilePathSalt: 'encrypted_path_salt',
  showAsterisk: true,
  minPasswordLength: 6,
  maxPasswordLength: 100,
  maxTargetFileSize: Number.POSITIVE_INFINITY,
  partCodePrefix: '.ghc-part',
  keepPlainPatterns: [],
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

  // Resolve encoding
  const encoding: string = cover<string>(
    resolvedDefaultOptions.encoding,
    options.encoding,
    isNonBlankString,
  )
  logger.debug('encoding:', encoding)

  // Resolve pbkdf2Options
  const pbkdf2Options: IPBKDF2Options = {
    salt: cover<BinaryLike>(
      resolvedDefaultOptions.pbkdf2Options.salt,
      options.pbkdf2Options?.salt,
      isNonBlankString,
    ),
    iterations: cover<number>(
      resolvedDefaultOptions.pbkdf2Options.iterations,
      convertToNumber(options.pbkdf2Options?.iterations),
    ),
    keylen: cover<number>(
      resolvedDefaultOptions.pbkdf2Options.keylen,
      convertToNumber(options.pbkdf2Options?.keylen),
    ),
    digest: cover<string>(
      resolvedDefaultOptions.pbkdf2Options.digest,
      options.pbkdf2Options?.digest,
      isNonBlankString,
    ) as IPBKDF2Options['digest'],
  }
  logger.debug('pbkdf2Options:', pbkdf2Options)

  // Resolve cryptRootDir
  const cryptRootDir: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(resolvedDefaultOptions.cryptRootDir, options.cryptRootDir, isNonBlankString),
  )
  logger.debug('cryptRootDir:', cryptRootDir)

  // Resolve encryptedFilesDir
  const encryptedFilesDir: string = cover<string>(
    resolvedDefaultOptions.encryptedFilesDir,
    options.encryptedFilesDir,
    isNonBlankString,
  )
  logger.debug('encryptedFilesDir:', encryptedFilesDir)

  // Resolve secretFilepath
  const secretFilepath: string = absoluteOfWorkspace(
    workspaceDir,
    cover<string>(resolvedDefaultOptions.secretFilepath, options.secretFilepath, isNonBlankString),
  )
  logger.debug('secretFilepath:', secretFilepath)

  // Resolve catalogFilepath
  const catalogFilepath: string = absoluteOfWorkspace(
    cryptRootDir,
    cover<string>(
      resolvedDefaultOptions.catalogFilepath,
      options.catalogFilepath,
      isNonBlankString,
    ),
  )
  logger.debug('catalogFilepath:', catalogFilepath)

  // Resolve encryptedFilePathSalt
  const encryptedFilePathSalt: string = cover<string>(
    resolvedDefaultOptions.encryptedFilePathSalt,
    options.encryptedFilePathSalt,
    isNonBlankString,
  )
  logger.debug('encryptedFilePathSalt:', encryptedFilePathSalt)

  // Resolve showAsterisk
  const showAsterisk: boolean = cover<boolean>(
    resolvedDefaultOptions.showAsterisk,
    convertToBoolean(options.showAsterisk),
  )
  logger.debug('showAsterisk:', showAsterisk)

  // Resolve minPasswordLength
  const minPasswordLength: number = cover<number>(
    resolvedDefaultOptions.minPasswordLength,
    convertToNumber(options.minPasswordLength),
  )
  logger.debug('minPasswordLength:', minPasswordLength)

  // Resolve maxPasswordLength
  const maxPasswordLength: number = cover<number>(
    resolvedDefaultOptions.maxPasswordLength,
    convertToNumber(options.maxPasswordLength),
  )
  logger.debug('maxPasswordLength:', maxPasswordLength)

  // Resolve maxTargetFileSize
  const maxTargetFileSize: number | undefined = cover<number | undefined>(
    resolvedDefaultOptions.maxTargetFileSize,
    convertToNumber(options.maxTargetFileSize),
  )
  logger.debug('maxTargetFileSize:', maxTargetFileSize)

  // Resolve partCodePrefix
  const partCodePrefix: string = cover<string>(
    resolvedDefaultOptions.partCodePrefix,
    options.partCodePrefix,
    isNonBlankString,
  )
  logger.debug('partCodePrefix:', partCodePrefix)

  return {
    ...resolvedDefaultOptions,
    encoding,
    pbkdf2Options,
    secretFilepath,
    catalogFilepath,
    cryptRootDir,
    encryptedFilesDir,
    encryptedFilePathSalt,
    showAsterisk,
    minPasswordLength,
    maxPasswordLength,
    maxTargetFileSize,
    partCodePrefix,
  }
}
