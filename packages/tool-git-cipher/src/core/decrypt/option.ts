import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import { cover } from '@guanghechen/helper-option'
import { absoluteOfWorkspace } from '@guanghechen/helper-path'
import { logger } from '../../env/logger'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

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

const getDefaultCommandDecryptOptions = (): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(),
  outDir: null,
  filesOnly: null,
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

  // Resolve outDir
  const outDir: string | null = (() => {
    const _rawOutDir = cover<string | null>(baseOptions.outDir, options.outDir)
    if (_rawOutDir == null) return null
    return absoluteOfWorkspace(baseOptions.workspace, _rawOutDir)
  })()
  logger.debug('outDir:', outDir)

  // Resolve filesAt
  const filesOnly: string | null = cover<string | null>(
    baseOptions.filesOnly,
    (options.filesOnly as unknown) === true ? 'HEAD' : options.filesOnly,
  )
  logger.debug('filesOnly:', filesOnly)

  const resolvedOptions: ISubCommandOptions = { outDir, filesOnly }
  return { ...baseOptions, ...resolvedOptions }
}
