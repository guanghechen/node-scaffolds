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
    .description('Decrypt git repo or decrypt files on a branch/commit only.')
    .option(
      '--catalog-cache-filepath, --catalogCacheFilepath <catalogCacheFilepath>',
      'The path where catalog cache file located. (relative of workspace)',
    )
    .option(
      '--files-at, --filesAt [commitHash]',
      'Decrypt files only at the given commit id or branch.',
    )
    .option(
      '--files-only, --filesOnly <filesOnly>',
      'Specify which files need to decrypt.',
      (val, acc: string[]) => acc.concat(val),
      [],
    )
    .option('--git-gpg-sign', `Config git commit.gpgSign to 'true'.`)
    .option('--no-git-gpg-sign', `Config git commit.gpgSign to 'false'.`)
    .option(
      '--out-dir, --outDir <outDir>',
      'Root dir of decrypted outputs. (Relative of workspace)',
    )
    .action(async function (args: string[], options: ISubCommandDecryptOptions) {
      const resolvedOptions: ISubCommandDecryptOptions = resolveSubCommandDecryptOptions(
        COMMAND_NAME,
        subCommandName,
        options,
      )
      await handle?.(resolvedOptions, args)
    })

  return command
}
