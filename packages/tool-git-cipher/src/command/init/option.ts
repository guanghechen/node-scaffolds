import type { IPBKDF2Options } from '@guanghechen/cipher'
import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isNonBlankString, isNotEmptyArray } from '@guanghechen/helper-is'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import { convertToBoolean, convertToNumber, cover } from '@guanghechen/helper-option'
import { physicalPathResolver as pathResolver } from '@guanghechen/path'
import { randomBytes } from 'node:crypto'
import { logger } from '../../core/logger'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions {
  /**
   * The path of catalog file of crypt repo. (relative of cryptRootDir)
   * @default '.ghc-catalog'
   */
  readonly catalogFilepath: string
  /**
   * Hash algorithm for generate MAC for content.
   * @default 'sha256
   */
  readonly contentHashAlgorithm: IHashAlgorithm
  /**
   * Salt for generate encrypted file path. (utf8 string)
   * @default 'ac2bf19c04d532'
   */
  readonly cryptFilepathSalt: string
  /**
   * The path of not-plain files located. (relative of cryptRootDir)
   * @default 'encrypted'
   */
  readonly cryptFilesDir: string
  /**
   * Set the git config 'commit.gpgSign'.
   */
  readonly gitGpgSign: boolean | undefined
  /**
   * Glob patterns indicated which files should be keepPlain.
   * @default []
   */
  readonly keepPlainPatterns: string[]
  /**
   * IV size of main cipherFactory.
   * @default 12
   */
  readonly mainIvSize: number
  /**
   * Key size of main cipherFactory.
   * @default 32
   */
  readonly mainKeySize: number
  /**
   * Max size (byte) of target file, once the file size exceeds this value,
   * the target file is split into multiple files.
   */
  readonly maxTargetFileSize: number | undefined
  /**
   * Prefix of parts code.
   * @default '.ghc-part'
   */
  readonly partCodePrefix: string
  /**
   * Hash algorithm for generate MAC for filepath.
   * @default 'sha256'
   */
  readonly pathHashAlgorithm: IHashAlgorithm
  /**
   * Options for PBKDF2 algorithm.
   */
  readonly pbkdf2Options: IPBKDF2Options
  /**
   * IV size of the secret cipherFactory.
   * @default 12
   */
  readonly secretIvSize: number
  /**
   * Key size of the secret cipherFactory.
   * @default 32
   */
  readonly secretKeySize: number
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandInitOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandInitOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  catalogFilepath: '.ghc-catalog',
  contentHashAlgorithm: 'sha1',
  cryptFilepathSalt: randomBytes(8).toString('hex'),
  cryptFilesDir: 'encrypted',
  gitGpgSign: false,
  keepPlainPatterns: ['.ghc-config.json', '.ghc-secret.json'],
  mainIvSize: 12,
  mainKeySize: 32,
  maxTargetFileSize: Number.POSITIVE_INFINITY,
  partCodePrefix: '.ghc-part',
  pathHashAlgorithm: 'sha1',
  pbkdf2Options: {
    salt: randomBytes(12).toString('hex'),
    iterations: 200000,
    digest: 'sha256',
  },
  secretIvSize: 12,
  secretKeySize: 32,
})

export function resolveSubCommandInitOptions(
  commandName: string,
  subCommandName: string,
  options: ISubCommandInitOptions,
  [workspace]: string[],
): ISubCommandInitOptions {
  const baseOptions: ISubCommandInitOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandInitOptions,
    { ...options, workspace },
  )

  // Resolve catalogFilepath
  const catalogFilepath: string = pathResolver.safeResolve(
    baseOptions.cryptRootDir,
    cover<string>(baseOptions.catalogFilepath, options.catalogFilepath, isNonBlankString),
  )
  logger.debug('catalogFilepath:', catalogFilepath)

  // Resolve contentHashAlgorithm
  const contentHashAlgorithm: IHashAlgorithm = cover<IHashAlgorithm>(
    baseOptions.contentHashAlgorithm,
    options.contentHashAlgorithm,
    isNonBlankString,
  )
  logger.debug('contentHashAlgorithm:', contentHashAlgorithm)

  // Resolve cryptFilepathSalt
  const cryptFilepathSalt: string = cover<string>(
    baseOptions.cryptFilepathSalt,
    options.cryptFilepathSalt,
    isNonBlankString,
  )
  logger.debug('cryptFilepathSalt:', cryptFilepathSalt)

  // Resolve cryptFilesDir
  const cryptFilesDir: string = cover<string>(
    baseOptions.cryptFilesDir,
    options.cryptFilesDir,
    isNonBlankString,
  )
  logger.debug('cryptFilesDir:', cryptFilesDir)

  // Resolve gitGpgSign
  const gitGpgSign: boolean | undefined = cover<boolean | undefined>(
    baseOptions.gitGpgSign,
    convertToBoolean(options.gitGpgSign),
  )
  logger.debug('gitGpgSign:', gitGpgSign)

  // Resolve keepPlainPatterns
  const keepPlainPatterns: string[] = cover<string[]>(
    baseOptions.keepPlainPatterns ?? [],
    options.keepPlainPatterns,
    isNotEmptyArray,
  )
    .map(p => p.trim())
    .filter(Boolean)
  logger.debug('keepPlainPatterns:', keepPlainPatterns)

  // Resolve mainIvSize
  const mainIvSize: number = cover<number>(
    baseOptions.mainIvSize,
    convertToNumber(options.mainIvSize),
  )
  logger.debug('mainIvSize:', mainIvSize)

  // Resolve mainKeySize
  const mainKeySize: number = cover<number>(
    baseOptions.mainKeySize,
    convertToNumber(options.mainKeySize),
  )
  logger.debug('mainKeySize:', mainKeySize)

  // Resolve maxTargetFileSize
  const maxTargetFileSize: number | undefined = cover<number | undefined>(
    baseOptions.maxTargetFileSize,
    convertToNumber(options.maxTargetFileSize),
  )
  logger.debug('maxTargetFileSize:', maxTargetFileSize)

  // Resolve partCodePrefix
  const partCodePrefix: string = cover<string>(
    baseOptions.partCodePrefix,
    options.partCodePrefix,
    isNonBlankString,
  )
  logger.debug('partCodePrefix:', partCodePrefix)

  // Resolve pathHashAlgorithm
  const pathHashAlgorithm: IHashAlgorithm = cover<IHashAlgorithm>(
    baseOptions.pathHashAlgorithm,
    options.pathHashAlgorithm,
    isNonBlankString,
  )
  logger.debug('pathHashAlgorithm:', pathHashAlgorithm)

  // Resolve pbkdf2Options
  const pbkdf2Options: IPBKDF2Options = {
    salt: cover<string>(
      baseOptions.pbkdf2Options.salt,
      options.pbkdf2Options?.salt,
      isNonBlankString,
    ),
    iterations: cover<number>(
      baseOptions.pbkdf2Options.iterations,
      convertToNumber(options.pbkdf2Options?.iterations),
    ),
    digest: cover<string>(
      baseOptions.pbkdf2Options.digest,
      options.pbkdf2Options?.digest,
      isNonBlankString,
    ) as IPBKDF2Options['digest'],
  }
  logger.debug('pbkdf2Options:', pbkdf2Options)

  // Resolve secretIvSize
  const secretIvSize: number = cover<number>(
    baseOptions.secretIvSize,
    convertToNumber(options.secretIvSize),
  )
  logger.debug('secretIvSize:', secretIvSize)

  // Resolve secretKeySize
  const secretKeySize: number = cover<number>(
    baseOptions.secretKeySize,
    convertToNumber(options.secretKeySize),
  )
  logger.debug('secretKeySize:', secretKeySize)

  const resolvedOptions: ISubCommandOptions = {
    catalogFilepath,
    contentHashAlgorithm,
    cryptFilepathSalt,
    cryptFilesDir,
    gitGpgSign,
    keepPlainPatterns,
    mainIvSize,
    mainKeySize,
    maxTargetFileSize,
    partCodePrefix,
    pathHashAlgorithm,
    pbkdf2Options,
    secretIvSize,
    secretKeySize,
  }
  return { ...baseOptions, ...resolvedOptions }
}
