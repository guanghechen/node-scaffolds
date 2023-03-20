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
    .option(
      '--plain-filepath, --plainFilepath <plainFilepath>',
      'The file you want to check the plain content.',
    )
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
