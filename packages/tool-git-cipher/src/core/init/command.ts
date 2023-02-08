import { Command } from '@guanghechen/helper-commander'
import { PACKAGE_NAME } from '../../env/constant'
import { logger } from '../../env/logger'
import { resolveGlobalCommandOptions } from '../option'
import type { ISubCommandInitOptions } from './option'
import { getDefaultCommandOptions } from './option'

// Create Sub-command: init (i)
export const createSubCommandInit = (
  handle?: (options: ISubCommandInitOptions) => void | Promise<void>,
  commandName = 'init',
  aliases: string[] = ['i'],
): Command => {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .description('Initialize a encrypt / decrypt able git repo.')
    .arguments('<workspace>')
    .action(async function ([_workspaceDir], options: ISubCommandInitOptions) {
      logger.setName(commandName)

      const defaultOptions: ISubCommandInitOptions = resolveGlobalCommandOptions(
        PACKAGE_NAME,
        commandName,
        getDefaultCommandOptions(),
        _workspaceDir,
        options,
      )

      const resolvedOptions: ISubCommandInitOptions = { ...defaultOptions }
      await handle?.(resolvedOptions)
    })

  return command
}
