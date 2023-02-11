import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import { cover } from '@guanghechen/helper-option'
import { absoluteOfWorkspace } from '@guanghechen/helper-path'
import { PACKAGE_NAME } from '../../env/constant'
import { logger } from '../../env/logger'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveGlobalCommandOptions } from '../option'

interface ISubCommandOptions {
  /**
   * Root dir of decrypted outputs. (Relative of workspace)
   * @default null
   */
  readonly outDir: string | null
  /**
   * If specified, then all of the files under the given commitId will be decrypted.
   * Otherwise, the entire repo will be generated.
   * @default null
   */
  readonly filesOnly: string | null // <commit id | branch | null>
}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandDecryptOptions = ICommandOptions & ICommandConfigurationFlatOpts

export const getDefaultCommandDecryptOptions = (): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(),
  outDir: null,
  filesOnly: null,
})

export function resolveSubCommandDecryptOptions(
  commandName: string,
  workspaceDir: string,
  options: ISubCommandDecryptOptions,
): ISubCommandDecryptOptions {
  const defaultOptions: ICommandOptions = getDefaultCommandDecryptOptions()

  type R = IGlobalCommandOptions & ICommandConfigurationFlatOpts
  const globalOptions: R = resolveGlobalCommandOptions(
    PACKAGE_NAME,
    commandName,
    defaultOptions,
    workspaceDir,
    options,
  )

  // Resolve outDir
  const outDir: string | null = (() => {
    const _rawOutDir = cover<string | null>(defaultOptions.outDir, options.outDir)
    if (_rawOutDir == null) return null
    return absoluteOfWorkspace(globalOptions.workspace, _rawOutDir)
  })()
  logger.debug('outDir:', outDir)

  // Resolve filesAt
  const filesOnly: string | null = cover<string | null>(
    defaultOptions.filesOnly,
    (options.filesOnly as unknown) === true ? 'HEAD' : options.filesOnly,
  )
  logger.debug('filesOnly:', filesOnly)

  const resolvedOptions: ISubCommandOptions = { outDir, filesOnly }
  return { ...globalOptions, ...resolvedOptions }
}
