import type {
  ICommandConfigurationFlatOpts,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { cover } from '@guanghechen/helper-option'
import { absoluteOfWorkspace } from '@guanghechen/helper-path'
import { packageName } from '../../env/constant'
import { logger } from '../../env/logger'
import type { IGlobalCommandOptions } from '../option'
import { __defaultGlobalCommandOptions, resolveGlobalCommandOptions } from '../option'
import type { IGitCipherDecryptContext } from './context'
import { createGitCipherDecryptContext } from './context'

interface SubCommandOptions extends IGlobalCommandOptions {
  /**
   * root dir of outputs
   * @default null
   */
  readonly outDir: string | null
}

const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  outDir: null,
}

export type SubCommandDecryptOptions = SubCommandOptions & ICommandConfigurationFlatOpts

/**
 * create Sub-command: decrypt (e)
 */
export const createSubCommandDecrypt = function (
  handle?: ISubCommandProcessor<SubCommandDecryptOptions>,
  commandName = 'decrypt',
  aliases: string[] = ['d'],
): Command {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('--out-dir <outDir>', 'root dir of outputs (decrypted files)')
    .action(async function ([_workspaceDir], options: SubCommandDecryptOptions) {
      logger.setName(commandName)

      const defaultOptions: SubCommandDecryptOptions = resolveGlobalCommandOptions(
        packageName,
        commandName,
        __defaultCommandOptions,
        _workspaceDir,
        options,
      )

      // resolve outDir
      const outDir: string | null = (() => {
        const _rawOutDir = cover<string | null>(defaultOptions.outDir, options.outDir)
        if (_rawOutDir == null) return null
        return absoluteOfWorkspace(defaultOptions.workspace, _rawOutDir)
      })()
      logger.debug('outDir:', outDir)

      const resolvedOptions: SubCommandDecryptOptions = {
        ...defaultOptions,
        outDir,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}

/**
 * Create GitCipherDecryptContext
 * @param options
 */
export async function createGitCipherDecryptContextFromOptions(
  options: SubCommandDecryptOptions,
): Promise<IGitCipherDecryptContext> {
  const context: IGitCipherDecryptContext = await createGitCipherDecryptContext({
    cwd: options.cwd,
    workspace: options.workspace,
    encoding: options.encoding,
    secretFilepath: options.secretFilepath,
    indexFilepath: options.indexFilepath,
    cipheredIndexEncoding: options.cipheredIndexEncoding,
    ciphertextRootDir: options.ciphertextRootDir,
    plaintextRootDir: options.plaintextRootDir,
    showAsterisk: options.showAsterisk,
    minPasswordLength: options.minPasswordLength,
    maxPasswordLength: options.maxPasswordLength,
    maxTargetFileSize: options.maxTargetFileSize,
    outDir: options.outDir,
  })
  return context
}
