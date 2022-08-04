import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { packageName } from '../../env/constant'
import { logger } from '../../env/logger'
import type { IGlobalCommandOptions } from '../option'
import { __defaultGlobalCommandOptions, resolveGlobalCommandOptions } from '../option'
import type { IGitCipherInitContext } from './context'
import { createGitCipherInitContext } from './context'

type ISubCommandOptions = IGlobalCommandOptions

const __defaultCommandOptions: ISubCommandOptions = {
  ...__defaultGlobalCommandOptions,
}

export type ISubCommandInitOptions = ISubCommandOptions & ICommandConfigurationFlatOpts

/**
 * create Sub-command: init (i)
 */
export const createSubCommandInit = function (
  handle?: (options: ISubCommandInitOptions) => void | Promise<void>,
  commandName = 'init',
  aliases: string[] = ['i'],
): Command {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .action(async function ([_workspaceDir], options: ISubCommandInitOptions) {
      logger.setName(commandName)

      const defaultOptions: ISubCommandInitOptions = resolveGlobalCommandOptions(
        packageName,
        commandName,
        __defaultCommandOptions,
        _workspaceDir,
        options,
      )

      const resolvedOptions: ISubCommandInitOptions = {
        ...defaultOptions,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}

/**
 * Create GitCipherInitContext
 * @param options
 */
export async function createGitCipherInitContextFromOptions(
  options: ISubCommandInitOptions,
): Promise<IGitCipherInitContext> {
  const context: IGitCipherInitContext = await createGitCipherInitContext({
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
  })
  return context
}
