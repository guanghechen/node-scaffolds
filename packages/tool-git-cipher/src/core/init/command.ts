import { Command } from '@guanghechen/helper-commander'
import { packageName } from '../../env/constant'
import { logger } from '../../env/logger'
import { resolveGlobalCommandOptions } from '../option'
import type { ISubCommandInitOptions } from './option'
import { getDefaultCommandOptions } from './option'

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
        getDefaultCommandOptions(),
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
