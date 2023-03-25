import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../env/constant'
import type { ISubCommandEncryptOptions } from './option'
import { resolveSubCommandEncryptOptions } from './option'

// Create Sub-command: encrypt (e)
export const createSubCommandEncrypt = (
  handle?: ISubCommandProcessor<ISubCommandEncryptOptions>,
  subCommandName = 'encrypt',
  aliases: string[] = ['e'],
): Command => {
  const command = new Command()

  command
    .name(subCommandName)
    .aliases(aliases)
    .description('Encrypt git repo.')
    .option(
      '--catalog-cache-filepath, --catalogCacheFilepath <catalogCacheFilepath>',
      'The path where catalog cache file located. (relative of workspace)',
    )
    .option(
      '--files-only, --filesOnly <filesOnly>',
      'Specify which files need to decrypt.',
      (val, acc: string[]) => acc.concat(val),
      [],
    )
    .action(async function (args: string[], options: ISubCommandEncryptOptions) {
      const resolvedOptions: ISubCommandEncryptOptions = resolveSubCommandEncryptOptions(
        COMMAND_NAME,
        subCommandName,
        options,
      )
      await handle?.(resolvedOptions, args)
    })

  return command
}
