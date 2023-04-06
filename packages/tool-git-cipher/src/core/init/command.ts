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
    .arguments('<workspace>')
    .description('Initialize a encrypt / decrypt able git repo.')
    .option(
      '--catalog-filepath, --catalogFilepath <catalogFilepath>',
      'The path of catalog file of crypt repo. (relative of cryptRootDir)',
    )
    .option(
      '--content-hash-algorithm, --contentHashAlgorithm <contentHashAlgorithm>',
      'Hash algorithm for generate MAC for content.',
    )
    .option(
      '--crypt-filepath-salt, --cryptFilepathSalt <cryptFilepathSalt>',
      'Salt for generate encrypted file path. (utf8 string)',
    )
    .option(
      '--crypt-files-dir, --cryptFilesDir <cryptFilesDir>',
      'The path of not-plain files located. (relative of cryptRootDir)',
    )
    .option('--git-gpg-sign', `Config git commit.gpgSign to 'true'.`)
    .option('--no-git-gpg-sign', `Config git commit.gpgSign to 'false'.`)
    .option(
      '--secret-key-size, --secretKeySize <secretKeySize>',
      'Key size of the secret cipherFactory.',
    )
    .option(
      '--keep-plain-pattens, --keepPlainPatterns <keepPlainPatterns>',
      'Glob patterns indicated which files should be keepPlain.',
      (val, acc: string[]) => acc.concat(val),
      [],
    )
    .option('--main-iv-size, --mainIvSize <mainIvSize>', 'IV size of main cipherFactory.')
    .option('--main-key-size, --mainKeySize <mainKeySize>', 'Key size of main cipherFactory.')
    .option('--part-code-prefix, --partCodePrefix <partCodePrefix>', 'Prefix of parts code.')
    .option(
      '--path-hash-algorithm, --pathHashAlgorithm <pathHashAlgorithm>',
      'Hash algorithm for generate MAC for encrypted filepath.',
    )
    .option(
      '--secret-iv-size, --secretIvSize <secretIvSize>',
      'IV size of the secret cipherFactory.',
    )
    .option(
      '--secret-key-size, --secretKeySize <secretKeySize>',
      'Key size of the secret cipherFactory.',
    )
    .action(async function (args: string[], options: ISubCommandInitOptions) {
      const resolvedOptions: ISubCommandInitOptions = resolveSubCommandInitOptions(
        COMMAND_NAME,
        subCommandName,
        options,
        args,
      )
      await handle?.(resolvedOptions, args)
    })

  return command
}
