import type {
  ICommandConfigurationFlatOpts,
  IResolveDefaultOptionsParams,
} from '@guanghechen/helper-commander'
import { isNonBlankString } from '@guanghechen/helper-is'
import { cover } from '@guanghechen/helper-option'
import { pathResolver } from '@guanghechen/path'
import type { IReporter } from '@guanghechen/reporter.types'
import type { IGitCipherSubCommandOption } from '../_base'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions extends IGitCipherSubCommandOption {
  /**
   * The path of catalog cache file of crypt repo. (relative of workspace)
   * @default '.ghc-catalog.cache.encrypt.json'
   */
  readonly catalogCachePath: string
  /**
   * Crypt repo branch or commit id.
   */
  readonly cryptCommitId: string
  /**
   * Plain repo branch or commit id.
   */
  readonly plainCommitId: string | undefined
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type IGitCipherVerifyOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandVerifyOptions = (params: IResolveDefaultOptionsParams): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(params),
  catalogCachePath: '.ghc-catalog.cache.encrypt.json',
  cryptCommitId: 'HEAD',
  plainCommitId: undefined,
})

export function resolveSubCommandVerifyOptions(
  commandName: string,
  subCommandName: string,
  args: string[],
  options: IGitCipherVerifyOptions,
  reporter: IReporter,
): IGitCipherVerifyOptions {
  const baseOptions: IGitCipherVerifyOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    args,
    options,
    reporter,
    getDefaultCommandVerifyOptions,
  )

  // Resolve catalogCachePath
  const catalogCachePath: string = pathResolver.safeResolve(
    baseOptions.workspace,
    cover<string>(baseOptions.catalogCachePath, options.catalogCachePath, isNonBlankString),
  )
  reporter.debug('catalogCachePath:', catalogCachePath)

  // Resolve cryptCommitId
  const cryptCommitId: string = cover<string>(
    baseOptions.cryptCommitId,
    options.cryptCommitId,
    isNonBlankString,
  )
  reporter.debug('cryptCommitId:', cryptCommitId)

  // Resolve plainCommitId
  const plainCommitId: string | undefined = cover<string | undefined>(
    baseOptions.plainCommitId,
    options.plainCommitId,
    isNonBlankString,
  )
  reporter.debug('plainCommitId:', plainCommitId)

  const resolvedOptions: ISubCommandOptions = {
    catalogCachePath,
    cryptCommitId,
    plainCommitId,
  }
  return { ...baseOptions, ...resolvedOptions }
}
