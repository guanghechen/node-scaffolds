import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../env/constant'
import type { ISubCommandCatOptions } from './option'
import { resolveSubCommandCatOptions } from './option'

// Create Sub-command: cat (c)
export const createSubCommandCat = (
  handle?: ISubCommandProcessor<ISubCommandCatOptions>,
  subCommandName = 'cat',
  aliases: string[] = ['c'],
): Command => {
  const command = new Command()

  command
    .name(subCommandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .description('Show plain content of a specified crypt file on a branch/commit.')
    .option('--commit-id <commitId>', 'Git branch or commit id.')
    .action(async function ([_workspaceDir], options: ISubCommandCatOptions) {
      const resolvedOptions: ISubCommandCatOptions = resolveSubCommandCatOptions(
        COMMAND_NAME,
        subCommandName,
        _workspaceDir,
        options,
      )
      await handle?.(resolvedOptions)
    })

  return command
}
