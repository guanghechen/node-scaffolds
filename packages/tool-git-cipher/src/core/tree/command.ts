import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../env/constant'
import type { ISubCommandTreeOptions } from './option'
import { resolveSubCommandTreeOptions } from './option'

// Create Sub-command: tree
export const createSubCommandTree = (
  handle?: ISubCommandProcessor<ISubCommandTreeOptions>,
  subCommandName = 'tree',
  aliases: string[] = [],
): Command => {
  const command = new Command()

  command
    .name(subCommandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .description('Preview staged files in plainRootDir with tree style')
    .option('--files-at, --filesAt <commitHash>', 'Crypt repo branch or commit id.')
    .action(async function ([_workspaceDir], options: ISubCommandTreeOptions) {
      const resolvedOptions: ISubCommandTreeOptions = resolveSubCommandTreeOptions(
        COMMAND_NAME,
        subCommandName,
        _workspaceDir,
        options,
      )
      await handle?.(resolvedOptions)
    })

  return command
}
