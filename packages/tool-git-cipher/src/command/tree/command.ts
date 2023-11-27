import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import {
  Command,
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../shared/core/constant'
import { wrapErrorHandler } from '../../shared/core/error'
import type { ISubCommandTreeOptions } from './option'
import { resolveSubCommandTreeOptions } from './option'
import { tree } from './run'

// Mount Sub-command: tree
export const mountSubCommandTree: ISubCommandMounter =
  createSubCommandMounter<ISubCommandTreeOptions>(commandTree, wrapErrorHandler(tree))

// Execute sub-command: tree
export const execSubCommandTree: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandTreeOptions>(commandTree, wrapErrorHandler(tree))

// Create Sub-command: tree
function commandTree(
  handle?: ISubCommandProcessor<ISubCommandTreeOptions>,
  subCommandName = 'tree',
  aliases: string[] = [],
): Command {
  const command = new Command()

  command
    .name(subCommandName)
    .aliases(aliases)
    .description('Preview staged files in plainRootDir with tree style')
    .option('--files-at, --filesAt <commitHash>', 'Crypt repo branch or commit id.')
    .action(async function (args: string[], options: ISubCommandTreeOptions) {
      const resolvedOptions: ISubCommandTreeOptions = resolveSubCommandTreeOptions(
        COMMAND_NAME,
        subCommandName,
        options,
      )
      await handle?.(resolvedOptions, args)
    })

  return command
}
