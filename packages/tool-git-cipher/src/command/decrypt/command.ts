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
import { COMMAND_NAME } from '../../core/constant'
import { wrapErrorHandler } from '../../core/error'
import type { ISubCommandDecryptOptions } from './option'
import { resolveSubCommandDecryptOptions } from './option'
import { decrypt } from './run'

// Mount Sub-command: decrypt
export const mountSubCommandDecrypt: ISubCommandMounter =
  createSubCommandMounter<ISubCommandDecryptOptions>(commandDecrypt, wrapErrorHandler(decrypt))

// Execute sub-command: decrypt
export const execSubCommandDecrypt: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandDecryptOptions>(commandDecrypt, wrapErrorHandler(decrypt))

// Create Sub-command: decrypt (d)
function commandDecrypt(
  handle?: ISubCommandProcessor<ISubCommandDecryptOptions>,
  subCommandName = 'decrypt',
  aliases: string[] = ['d'],
): Command {
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
