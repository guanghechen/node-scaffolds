import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import { isString } from '@guanghechen/helper-is'
import { convertToBoolean, cover } from '@guanghechen/helper-option'
import { absoluteOfWorkspace } from '@guanghechen/helper-path'
import { logger } from '../../env/logger'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

interface ISubCommandOptions {
  /**
   * If specified, then all of the files under the given commitId will be decrypted.
   * Otherwise, the entire repo will be generated.
   * @default null
   */
  readonly filesOnly: string | undefined // <commit id | branch | null>
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

const getDefaultCommandDecryptOptions = (): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(),
  outDir: '.ghc-plain-bak',
  filesOnly: undefined,
  gitGpgSign: false,
})

export function resolveSubCommandDecryptOptions(
  commandName: string,
  subCommandName: string,
  workspaceDir: string,
  options: ISubCommandDecryptOptions,
): ISubCommandDecryptOptions {
  const baseOptions: ISubCommandDecryptOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandDecryptOptions(),
    workspaceDir,
    options,
  )

  // Resolve filesAt
  const filesOnly: string | undefined = cover<string | undefined>(
    baseOptions.filesOnly,
    (options.filesOnly as unknown) === true ? 'HEAD' : options.filesOnly,
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

  const resolvedOptions: ISubCommandOptions = { filesOnly, gitGpgSign, outDir }
  return { ...baseOptions, ...resolvedOptions }
}
