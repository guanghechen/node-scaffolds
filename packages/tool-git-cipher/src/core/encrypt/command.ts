import { Command } from '@guanghechen/helper-commander'
import { PACKAGE_NAME } from '../../env/constant'
import { logger } from '../../env/logger'
import { resolveGlobalCommandOptions } from '../option'
import type { ISubCommandEncryptOptions } from './option'
import { getDefaultCommandEncryptOptions } from './option'

// Create Sub-command: encrypt (e)
export const createSubCommandEncrypt = (
  handle?: (options: ISubCommandEncryptOptions) => void | Promise<void>,
  commandName = 'encrypt',
  aliases: string[] = ['e'],
): Command => {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .action(async function ([_workspaceDir], options: ISubCommandEncryptOptions) {
      logger.setName(commandName)

      const defaultOptions: ISubCommandEncryptOptions = resolveGlobalCommandOptions(
        PACKAGE_NAME,
        commandName,
        getDefaultCommandEncryptOptions(),
        _workspaceDir,
        options,
      )

      const resolvedOptions: ISubCommandEncryptOptions = { ...defaultOptions }
      await handle?.(resolvedOptions)
    })

  return command
}
