import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import type { ISubCommandDecryptOptions } from './option'
import { resolveSubCommandDecryptOptions } from './option'

// Create Sub-command: decrypt (e)
export const createSubCommandDecrypt = (
  handle?: ISubCommandProcessor<ISubCommandDecryptOptions>,
  commandName = 'decrypt',
  aliases: string[] = ['d'],
): Command => {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .description('Decrypt git repo or decrypt files on a branch/commit only.')
    .option('--out-dir <outDir>', 'Root dir of decrypted outputs. (Relative of workspace)')
    .option(
      '--files-only [commitId]',
      '(commit id | branch) decrypt files only at the given commit id or branch.',
    )
    .action(async function ([_workspaceDir], options: ISubCommandDecryptOptions) {
      const resolvedOptions: ISubCommandDecryptOptions = resolveSubCommandDecryptOptions(
        commandName,
        _workspaceDir,
        options,
      )
      await handle?.(resolvedOptions)
    })

  return command
}
