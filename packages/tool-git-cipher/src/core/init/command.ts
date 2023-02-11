import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { logger } from '../../env/logger'
import type { ISubCommandInitOptions } from './option'
import { resolveSubCommandInitOptions } from './option'

// Create Sub-command: init (i)
export const createSubCommandInit = (
  handle?: ISubCommandProcessor<ISubCommandInitOptions>,
  commandName = 'init',
  aliases: string[] = ['i'],
): Command => {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .description('Initialize a encrypt / decrypt able git repo.')
    .arguments('<workspace>')
    .option(
      '--catalog-filepath <catalogFilepath>',
      'The path of catalog file of crypt repo. (relative of cryptRootDir)',
    )
    .option(
      '--crypt-filepath-salt <cryptFilepathSalt>',
      'Salt for generate encrypted file path. (utf8 string)',
    )
    .option(
      '--crypt-files-dir <cryptFilesDir>',
      'The path of not-plain files located. (relative of cryptRootDir)',
    )
    .option('--main-iv-size <mainIvSize>', 'IV size of main cipherFactory.')
    .option('--main-key-size <mainKeySize>', 'Key size of main cipherFactory.')
    .option('--part-code-prefix <partCodePRefix>', 'Prefix of parts code.')
    .option('--secret-iv-size <secretIvSize>', 'IV size of the secret cipherFactory.')
    .option('--secret-key-size <secretKeySize>', 'Key size of the secret cipherFactory.')
    .action(async function ([_workspaceDir], options: ISubCommandInitOptions) {
      logger.setName(commandName)

      const resolvedOptions: ISubCommandInitOptions = resolveSubCommandInitOptions(
        commandName,
        _workspaceDir,
        options,
      )
      await handle?.(resolvedOptions)
    })

  return command
}
