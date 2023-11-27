import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isNonBlankString, isNotEmptyArray } from '@guanghechen/helper-is'
import { convertToBoolean, cover } from '@guanghechen/helper-option'
import { pathResolver } from '@guanghechen/path'
import type { IReporter } from '@guanghechen/reporter.types'
import type { IGitCipherSubCommandOption } from '../_base'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions extends IGitCipherSubCommandOption {
  /**
   * The path of catalog cache file of crypt repo. (relative of workspace)
   * @default '.ghc-cache-catalog.decrypt.json'
   */
  readonly catalogCacheFilepath: string
  /**
   * Crypt repo commit hash, if specified, then decrypt files only at the given commit id or branch.
   */
  readonly filesAt: string | undefined
  /**
   * Specify which files need to decrypt.
   *
   * If not empty, then the `filesAt` will resoled as string (fallback: `HEAD`), and only files
   * in the `filesOnly` will be decrypted. Otherwise, if `filesAt` is not undefined, then all files
   * will be decrypted.
   * @default []
   */
  readonly filesOnly: string[] // <commit id | branch | null>
  /**
   * Set the git config 'commit.gpgSign'.
   */
  readonly gitGpgSign: boolean | undefined
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type IGitCipherDecryptOption = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandDecryptOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => {
  return {
    ...getDefaultGlobalCommandOptions(params),
    catalogCacheFilepath: '.ghc-cache-catalog.decrypt.json',
    filesAt: undefined,
    filesOnly: [],
    gitGpgSign: false,
  }
}

export function resolveSubCommandDecryptOptions(
  commandName: string,
  subCommandName: string,
  args: string[],
  options: IGitCipherDecryptOption,
  reporter: IReporter,
): IGitCipherDecryptOption {
  const baseOptions: IGitCipherDecryptOption = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    args,
    options,
    reporter,
    getDefaultCommandDecryptOptions,
  )

  // Resolve catalogCacheFilepath
  const catalogCacheFilepath: string = pathResolver.safeResolve(
    baseOptions.workspace,
    cover<string>(baseOptions.catalogCacheFilepath, options.catalogCacheFilepath, isNonBlankString),
  )
  reporter.debug('catalogCacheFilepath:', catalogCacheFilepath)

  // Resolve filesAt
  const filesAt: string | undefined = cover<string | undefined>(
    baseOptions.filesAt,
    options.filesAt,
    isNonBlankString,
  )
  reporter.debug('filesAt:', filesAt)

  // Resolve filesOnly
  const filesOnly: string[] = cover<string[]>(
    baseOptions.filesOnly,
    options.filesOnly,
    isNotEmptyArray,
  )
  reporter.debug('filesOnly:', filesOnly)

  // Resolve gitGpgSign
  const gitGpgSign: boolean | undefined = cover<boolean | undefined>(
    baseOptions.gitGpgSign,
    convertToBoolean(options.gitGpgSign),
  )
  reporter.debug('gitGpgSign:', gitGpgSign)

  const resolvedOptions: ISubCommandOptions = {
    catalogCacheFilepath,
    filesAt,
    filesOnly,
    gitGpgSign,
  }
  return { ...baseOptions, ...resolvedOptions }
}
