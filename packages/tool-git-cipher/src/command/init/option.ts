import { bytes2text, randomBytes } from '@guanghechen/byte'
import type { IPBKDF2Options } from '@guanghechen/cipher'
import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isNonBlankString, isNotEmptyArray } from '@guanghechen/helper-is'
import { convertToBoolean, convertToNumber, cover } from '@guanghechen/helper-option'
import type { IHashAlgorithm } from '@guanghechen/mac'
import { pathResolver } from '@guanghechen/path'
import type { IReporter } from '@guanghechen/reporter.types'
import type { IGitCipherSubCommandOption } from '../_base'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions extends IGitCipherSubCommandOption {
  /**
   * The path of catalog file of crypt repo. (relative of cryptRootDir)
   * @default '.ghc-catalog'
   */
  readonly catalogConfigPath: string
  /**
   * Hash algorithm for generate MAC for content.
   * @default 'sha256
   */
  readonly contentHashAlgorithm: IHashAlgorithm
  /**
   * The path of not-plain files located. (relative of cryptRootDir)
   * @default 'encrypted'
   */
  readonly cryptFilesDir: string
  /**
   * Salt for generate encrypted file path. (utf8 string)
   * @default 'ac2bf19c04d532'
   */
  readonly cryptPathSalt: string
  /**
   * Set the git config 'commit.gpgSign'.
   */
  readonly gitGpgSign: boolean | undefined
  /**
   * Glob patterns indicated which files should be keepIntegrity.
   * @default []
   */
  readonly integrityPatterns: string[]
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
  readonly maxCryptFileSize: number | undefined
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
export type IGitCipherInitOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandInitOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  catalogConfigPath: '.ghc-catalog',
  contentHashAlgorithm: 'sha256',
  cryptPathSalt: bytes2text(randomBytes(8), 'hex'),
  cryptFilesDir: 'encrypted',
  gitGpgSign: false,
  integrityPatterns: ['.ghc-config.json', '.ghc-secret.json'],
  keepPlainPatterns: ['.ghc-config.json', '.ghc-secret.json'],
  mainIvSize: 12,
  mainKeySize: 32,
  maxCryptFileSize: Number.POSITIVE_INFINITY,
  partCodePrefix: '.ghc-part',
  pathHashAlgorithm: 'sha1',
  pbkdf2Options: {
    salt: bytes2text(randomBytes(12), 'hex'),
    iterations: 200000,
    digest: 'sha256',
  },
  secretIvSize: 12,
  secretKeySize: 32,
})

export function resolveSubCommandInitOptions(
  commandName: string,
  subCommandName: string,
  args: string[],
  options: IGitCipherInitOptions,
  reporter: IReporter,
): IGitCipherInitOptions {
  const [workspace] = args
  const baseOptions: IGitCipherInitOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    args,
    { ...options, workspace },
    reporter,
    getDefaultCommandInitOptions,
  )

  // Resolve catalogConfigPath
  const catalogConfigPath: string = pathResolver.safeResolve(
    baseOptions.cryptRootDir,
    cover<string>(baseOptions.catalogConfigPath, options.catalogConfigPath, isNonBlankString),
  )
  reporter.debug('catalogConfigPath:', catalogConfigPath)

  // Resolve contentHashAlgorithm
  const contentHashAlgorithm: IHashAlgorithm = cover<IHashAlgorithm>(
    baseOptions.contentHashAlgorithm,
    options.contentHashAlgorithm,
    isNonBlankString,
  )
  reporter.debug('contentHashAlgorithm:', contentHashAlgorithm)

  // Resolve cryptPathSalt
  const cryptPathSalt: string = cover<string>(
    baseOptions.cryptPathSalt,
    options.cryptPathSalt,
    isNonBlankString,
  )
  reporter.debug('cryptPathSalt:', cryptPathSalt)

  // Resolve cryptFilesDir
  const cryptFilesDir: string = cover<string>(
    baseOptions.cryptFilesDir,
    options.cryptFilesDir,
    isNonBlankString,
  )
  reporter.debug('cryptFilesDir:', cryptFilesDir)

  // Resolve gitGpgSign
  const gitGpgSign: boolean | undefined = cover<boolean | undefined>(
    baseOptions.gitGpgSign,
    convertToBoolean(options.gitGpgSign),
  )
  reporter.debug('gitGpgSign:', gitGpgSign)

  // Resolve integrityPatterns
  const integrityPatterns: string[] = cover<string[]>(
    baseOptions.integrityPatterns ?? [],
    options.integrityPatterns,
    isNotEmptyArray,
  )
    .map(p => p.trim())
    .filter(Boolean)
  reporter.debug('integrityPatterns:', integrityPatterns)

  // Resolve keepPlainPatterns
  const keepPlainPatterns: string[] = cover<string[]>(
    baseOptions.keepPlainPatterns ?? [],
    options.keepPlainPatterns,
    isNotEmptyArray,
  )
    .map(p => p.trim())
    .filter(Boolean)
  reporter.debug('keepPlainPatterns:', keepPlainPatterns)

  // Resolve mainIvSize
  const mainIvSize: number = cover<number>(
    baseOptions.mainIvSize,
    convertToNumber(options.mainIvSize),
  )
  reporter.debug('mainIvSize:', mainIvSize)

  // Resolve mainKeySize
  const mainKeySize: number = cover<number>(
    baseOptions.mainKeySize,
    convertToNumber(options.mainKeySize),
  )
  reporter.debug('mainKeySize:', mainKeySize)

  // Resolve maxCryptFileSize
  const maxCryptFileSize: number | undefined = cover<number | undefined>(
    baseOptions.maxCryptFileSize,
    convertToNumber(options.maxCryptFileSize),
  )
  reporter.debug('maxCryptFileSize:', maxCryptFileSize)

  // Resolve partCodePrefix
  const partCodePrefix: string = cover<string>(
    baseOptions.partCodePrefix,
    options.partCodePrefix,
    isNonBlankString,
  )
  reporter.debug('partCodePrefix:', partCodePrefix)

  // Resolve pathHashAlgorithm
  const pathHashAlgorithm: IHashAlgorithm = cover<IHashAlgorithm>(
    baseOptions.pathHashAlgorithm,
    options.pathHashAlgorithm,
    isNonBlankString,
  )
  reporter.debug('pathHashAlgorithm:', pathHashAlgorithm)

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
  reporter.debug('pbkdf2Options:', pbkdf2Options)

  // Resolve secretIvSize
  const secretIvSize: number = cover<number>(
    baseOptions.secretIvSize,
    convertToNumber(options.secretIvSize),
  )
  reporter.debug('secretIvSize:', secretIvSize)

  // Resolve secretKeySize
  const secretKeySize: number = cover<number>(
    baseOptions.secretKeySize,
    convertToNumber(options.secretKeySize),
  )
  reporter.debug('secretKeySize:', secretKeySize)

  const resolvedOptions: ISubCommandOptions = {
    catalogConfigPath,
    contentHashAlgorithm,
    cryptPathSalt,
    cryptFilesDir,
    gitGpgSign,
    integrityPatterns,
    keepPlainPatterns,
    mainIvSize,
    mainKeySize,
    maxCryptFileSize,
    partCodePrefix,
    pathHashAlgorithm,
    pbkdf2Options,
    secretIvSize,
    secretKeySize,
  }
  return { ...baseOptions, ...resolvedOptions }
}
