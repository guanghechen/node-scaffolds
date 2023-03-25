import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../env/constant'
import type { ISubCommandMergeOptions } from './option'
import { resolveSubCommandMergeOptions } from './option'

// Create Sub-command: merge (m)
export const createSubCommandMerge = (
  handle?: ISubCommandProcessor<ISubCommandMergeOptions>,
  subCommandName = 'merge',
  aliases: string[] = ['m'],
): Command => {
  const command = new Command()

  command
    .name(subCommandName)
    .aliases(aliases)
    .arguments('<filepath>')
    .description('Merge file parts into the big file.')
    .action(async function (args: string[], options: ISubCommandMergeOptions) {
      const resolvedOptions: ISubCommandMergeOptions = resolveSubCommandMergeOptions(
        COMMAND_NAME,
        subCommandName,
        options,
      )
      await handle?.(resolvedOptions, args)
    })

  return command
}
