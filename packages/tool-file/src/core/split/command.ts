import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../env/constant'
import type { ISubCommandSplitOptions } from './option'
import { resolveSubCommandSplitOptions } from './option'

// Create Sub-command: split (s)
export const createSubCommandSplit = (
  handle?: ISubCommandProcessor<ISubCommandSplitOptions>,
  subCommandName = 'split',
  aliases: string[] = ['s'],
): Command => {
  const command = new Command()

  command
    .name(subCommandName)
    .aliases(aliases)
    .arguments('<filepath>')
    .description('Split big file into multiple parts.')
    .action(async function (args: string[], options: ISubCommandSplitOptions) {
      const resolvedOptions: ISubCommandSplitOptions = resolveSubCommandSplitOptions(
        COMMAND_NAME,
        subCommandName,
        options,
      )
      await handle?.(resolvedOptions, args)
    })

  return command
}
