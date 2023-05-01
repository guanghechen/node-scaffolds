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
import { COMMAND_NAME } from '../../core/constant'
import { resolveSubCommandCatOptions } from './option'
import type { ISubCommandCatOptions } from './option'
import { cat } from './run'

// Mount Sub-command: cat
export const mountSubCommandCat: ISubCommandMounter =
  createSubCommandMounter<ISubCommandCatOptions>(createSubCommandCat, cat)

// Execute sub-command: cat
export const execSubCommandCat: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandCatOptions>(createSubCommandCat, cat)

// Create Sub-command: cat (c)
export function createSubCommandCat(
  handle?: ISubCommandProcessor<ISubCommandCatOptions>,
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
      await handle?.(resolvedOptions, args)
    })

  return command
}
