import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import type { ISubCommandEncryptOptions } from './option'
import { resolveSubCommandEncryptOptions } from './option'

// Create Sub-command: encrypt (e)
export const createSubCommandEncrypt = (
  handle?: ISubCommandProcessor<ISubCommandEncryptOptions>,
  commandName = 'encrypt',
  aliases: string[] = ['e'],
): Command => {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .description('Encrypt git repo.')
    .arguments('<workspace>')
    .action(async function ([_workspaceDir], options: ISubCommandEncryptOptions) {
      const resolvedOptions: ISubCommandEncryptOptions = resolveSubCommandEncryptOptions(
        commandName,
        _workspaceDir,
        options,
      )
      await handle?.(resolvedOptions)
    })

  return command
}
