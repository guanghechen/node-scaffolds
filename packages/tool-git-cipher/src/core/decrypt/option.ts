import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isNonBlankString, isNotEmptyArray, isString } from '@guanghechen/helper-is'
import { convertToBoolean, cover } from '@guanghechen/helper-option'
import { absoluteOfWorkspace } from '@guanghechen/helper-path'
import path from 'node:path'
import { logger } from '../../env/logger'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions {
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
  /**
   * Root dir of decrypted outputs. (Relative of workspace)
   * @default null
   */
  readonly outDir: string | undefined
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandDecryptOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandDecryptOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => {
  const repoName = path.basename(params.workspace)
  return {
    ...getDefaultGlobalCommandOptions(params),
    catalogCacheFilepath: '.ghc-cache-catalog.decrypt.json',
    filesAt: undefined,
    filesOnly: [],
    gitGpgSign: false,
    outDir: `${repoName}-plain`,
  }
}

export function resolveSubCommandDecryptOptions(
  commandName: string,
  subCommandName: string,
  options: ISubCommandDecryptOptions,
): ISubCommandDecryptOptions {
  const baseOptions: ISubCommandDecryptOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandDecryptOptions,
    options,
  )

  // Resolve catalogCacheFilepath
  const catalogCacheFilepath: string = absoluteOfWorkspace(
    baseOptions.workspace,
    cover<string>(baseOptions.catalogCacheFilepath, options.catalogCacheFilepath, isNonBlankString),
  )
  logger.debug('catalogCacheFilepath:', catalogCacheFilepath)

  // Resolve filesAt
  const filesAt: string | undefined = cover<string | undefined>(
    baseOptions.filesAt,
    options.filesAt,
    isNonBlankString,
  )
  logger.debug('filesAt:', filesAt)

  // Resolve filesOnly
  const filesOnly: string[] = cover<string[]>(
    baseOptions.filesOnly,
    options.filesOnly,
    isNotEmptyArray,
  )
  logger.debug('filesOnly:', filesOnly)

  // Resolve gitGpgSign
  const gitGpgSign: boolean | undefined = cover<boolean | undefined>(
    baseOptions.gitGpgSign,
    convertToBoolean(options.gitGpgSign),
  )
  logger.debug('gitGpgSign:', gitGpgSign)

  // Resolve outDir
  const _rawOutDir = cover<string | undefined>(baseOptions.outDir, options.outDir)
  const outDir: string | undefined = isString(_rawOutDir)
    ? absoluteOfWorkspace(baseOptions.workspace, _rawOutDir)
    : undefined
  logger.debug('outDir:', outDir)

  const resolvedOptions: ISubCommandOptions = {
    catalogCacheFilepath,
    filesAt,
    filesOnly,
    gitGpgSign,
    outDir,
  }
  return { ...baseOptions, ...resolvedOptions }
}
