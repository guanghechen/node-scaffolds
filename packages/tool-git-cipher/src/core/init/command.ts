import type { CommandConfigurationFlatOpts } from '@guanghechen/commander-helper'
import { Command } from '@guanghechen/commander-helper'
import { packageName } from '../../env/constant'
import { logger } from '../../env/logger'
import type { GlobalCommandOptions } from '../option'
import {
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'
import type { GitCipherInitContext } from './context'
import { createGitCipherInitContext } from './context'

type SubCommandOptions = GlobalCommandOptions

const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
}

export type SubCommandInitOptions = SubCommandOptions &
  CommandConfigurationFlatOpts

/**
 * create Sub-command: init (i)
 */
export const createSubCommandInit = function (
  handle?: (options: SubCommandInitOptions) => void | Promise<void>,
  commandName = 'init',
  aliases: string[] = ['i'],
): Command {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .action(async function ([_workspaceDir], options: SubCommandInitOptions) {
      logger.setName(commandName)

      const defaultOptions: SubCommandInitOptions = resolveGlobalCommandOptions(
        packageName,
        commandName,
        __defaultCommandOptions,
        _workspaceDir,
        options,
      )

      const resolvedOptions: SubCommandInitOptions = {
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
  options: SubCommandInitOptions,
): Promise<GitCipherInitContext> {
  const context: GitCipherInitContext = await createGitCipherInitContext({
    cwd: options.cwd,
    workspace: options.workspace,
    encoding: options.encoding,
    secretFilepath: options.secretFilepath,
    secretFileEncoding: options.secretFileEncoding,
    indexFilepath: options.indexFilepath,
    indexFileEncoding: options.indexFileEncoding,
    ciphertextRootDir: options.ciphertextRootDir,
    plaintextRootDir: options.plaintextRootDir,
    showAsterisk: options.showAsterisk,
    minPasswordLength: options.minPasswordLength,
    maxPasswordLength: options.maxPasswordLength,
    maxTargetFileSize: options.maxTargetFileSize,
  })
  return context
}
