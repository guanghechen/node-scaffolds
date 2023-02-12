import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../env/constant'
import type { ISubCommandInitOptions } from './option'
import { resolveSubCommandInitOptions } from './option'

// Create Sub-command: init (i)
export const createSubCommandInit = (
  handle?: ISubCommandProcessor<ISubCommandInitOptions>,
  subCommandName = 'init',
  aliases: string[] = ['i'],
): Command => {
  const command = new Command()

  command
    .name(subCommandName)
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
    .option('--git-gpg-sign', `Config git commit.gpgSign to 'true'.`)
    .option('--no-git-gpg-sign', `Config git commit.gpgSign to 'false'.`)
    .option('--secret-key-size <secretKeySize>', 'Key size of the secret cipherFactory.')
    .option(
      '--keep-plain-pattens <keepPlainPatterns>',
      'Glob patterns indicated which files should be keepPlain.',
      (val, acc: string[]) => acc.concat(val),
      [],
    )
    .option('--main-iv-size <mainIvSize>', 'IV size of main cipherFactory.')
    .option('--main-key-size <mainKeySize>', 'Key size of main cipherFactory.')
    .option('--part-code-prefix <partCodePRefix>', 'Prefix of parts code.')
    .option('--secret-iv-size <secretIvSize>', 'IV size of the secret cipherFactory.')
    .option('--secret-key-size <secretKeySize>', 'Key size of the secret cipherFactory.')
    .action(async function ([_workspaceDir], options: ISubCommandInitOptions) {
      const resolvedOptions: ISubCommandInitOptions = resolveSubCommandInitOptions(
        COMMAND_NAME,
        subCommandName,
        _workspaceDir,
        options,
      )
      await handle?.(resolvedOptions)
    })

  return command
}
