import {
  Command,
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@guanghechen/helper-commander'
import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../shared/core/constant'
import { wrapErrorHandler } from '../../shared/core/error'
import { resolveSubCommandCatOptions } from './option'
import type { ISubCommandCatOptions } from './option'
import { cat } from './run'

// Mount Sub-command: cat
export const mountSubCommandCat: ISubCommandMounter =
  createSubCommandMounter<ISubCommandCatOptions>(commandCat, wrapErrorHandler(cat))

// Execute sub-command: cat
export const execSubCommandCat: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandCatOptions>(commandCat, wrapErrorHandler(cat))

// Create Sub-command: cat (c)
function commandCat(
  handle: ISubCommandProcessor<ISubCommandCatOptions>,
  subCommandName = 'cat',
  aliases: string[] = ['c'],
): Command {
  const command = new Command()

  command
    .name(subCommandName)
    .aliases(aliases)
    .description('Show plain content of a specified crypt file on a branch/commit.')
    .option(
      '--plain-filepath, --plainFilepath <plainFilepath>',
      'The file you want to check the plain content.',
    )
    .action(async function (args: string[], options: ISubCommandCatOptions) {
      const resolvedOptions: ISubCommandCatOptions = resolveSubCommandCatOptions(
        COMMAND_NAME,
        subCommandName,
        options,
      )
      await handle(resolvedOptions, args)
    })

  return command
}
