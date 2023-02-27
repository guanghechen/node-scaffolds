import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../env/constant'
import type { ISubCommandDecryptOptions } from './option'
import { resolveSubCommandDecryptOptions } from './option'

// Create Sub-command: decrypt (d)
export const createSubCommandDecrypt = (
  handle?: ISubCommandProcessor<ISubCommandDecryptOptions>,
  subCommandName = 'decrypt',
  aliases: string[] = ['d'],
): Command => {
  const command = new Command()

  command
    .name(subCommandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .description('Decrypt git repo or decrypt files on a branch/commit only.')
    .option(
      '--catalog-cache-filepath <catalogCacheFilepath>',
      'The path where catalog cache file located. (relative of workspace)',
    )
    .option(
      '--files-only [commitId]',
      '(commit id | branch) decrypt files only at the given commit id or branch.',
    )
    .option('--git-gpg-sign', `Config git commit.gpgSign to 'true'.`)
    .option('--no-git-gpg-sign', `Config git commit.gpgSign to 'false'.`)
    .option('--out-dir <outDir>', 'Root dir of decrypted outputs. (Relative of workspace)')
    .action(async function ([_workspaceDir], options: ISubCommandDecryptOptions) {
      const resolvedOptions: ISubCommandDecryptOptions = resolveSubCommandDecryptOptions(
        COMMAND_NAME,
        subCommandName,
        _workspaceDir,
        options,
      )
      await handle?.(resolvedOptions)
    })

  return command
}
